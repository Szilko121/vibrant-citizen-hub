--[[
    nexus-cityhall :: server
    Automatikus framework- és inventory-felismerés.
    Támogatott frameworkök: qbx_core (QBox), qb-core (QBCore), es_extended (ESX), standalone
    Támogatott inventoryk: ox_inventory, qb-inventory, ps-inventory, qs-inventory,
                           codem-inventory, core_inventory, origen_inventory,
                           esx default (addoninventory / xPlayer.addInventoryItem)
]]

local Framework = 'standalone'
local InventorySystem = 'none'
local QB, ESX

local function started(res)
    return GetResourceState(res) == 'started' or GetResourceState(res) == 'starting'
end

-- ============================ FRAMEWORK DETECT ============================

local function detectFramework()
    if Config.Framework ~= 'auto' then
        Framework = Config.Framework
    elseif started('qbx_core') then
        Framework = 'qbx'
    elseif started('qb-core') then
        Framework = 'qb'
    elseif started('es_extended') then
        Framework = 'esx'
    else
        Framework = 'standalone'
    end

    if Framework == 'qbx' then
        -- qbx_core exportokon keresztül működik, nincs szükség shared objectre
    elseif Framework == 'qb' then
        QB = exports['qb-core']:GetCoreObject()
    elseif Framework == 'esx' then
        if exports['es_extended'] then
            ESX = exports['es_extended']:getSharedObject()
        else
            TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
        end
    end

    print(('[nexus-cityhall] Framework: %s'):format(Framework))
end

-- ============================ INVENTORY DETECT ============================

local inventoryCandidates = {
    { res = 'ox_inventory',     name = 'ox' },
    { res = 'qs-inventory',     name = 'qs' },
    { res = 'codem-inventory',  name = 'codem' },
    { res = 'origen_inventory', name = 'origen' },
    { res = 'core_inventory',   name = 'core' },
    { res = 'ps-inventory',     name = 'qb' },
    { res = 'qb-inventory',     name = 'qb' },
}

local function detectInventory()
    if Config.Inventory ~= 'auto' then
        InventorySystem = Config.Inventory
    else
        for _, candidate in ipairs(inventoryCandidates) do
            if started(candidate.res) then
                InventorySystem = candidate.name
                break
            end
        end

        if InventorySystem == 'none' then
            if Framework == 'qb' or Framework == 'qbx' then
                InventorySystem = 'qb'
            elseif Framework == 'esx' then
                InventorySystem = 'esx'
            end
        end
    end

    print(('[nexus-cityhall] Inventory: %s'):format(InventorySystem))
end

-- ============================ PLAYER HELPERS ============================

local function getPlayer(src)
    if Framework == 'qbx' then
        return exports.qbx_core:GetPlayer(src)
    elseif Framework == 'qb' then
        return QB and QB.Functions.GetPlayer(src)
    elseif Framework == 'esx' then
        return ESX and ESX.GetPlayerFromId(src)
    end
    return nil
end

local function getName(src, player)
    if (Framework == 'qb' or Framework == 'qbx') and player then
        local ci = player.PlayerData and player.PlayerData.charinfo
        if ci and ci.firstname then
            return ('%s %s'):format(ci.firstname, ci.lastname or '')
        end
    elseif Framework == 'esx' and player then
        if player.getName then return player.getName() end
        local ci = player.get and player.get('firstName')
        if ci then
            return ('%s %s'):format(ci, player.get('lastName') or '')
        end
    end
    return GetPlayerName(src) or 'Ismeretlen'
end

local function getIdentifier(src, player)
    if (Framework == 'qb' or Framework == 'qbx') and player then
        return player.PlayerData and player.PlayerData.citizenid or ''
    elseif Framework == 'esx' and player then
        return player.identifier or ''
    end
    return tostring(src)
end

local function getMoney(src, player, account)
    if (Framework == 'qb' or Framework == 'qbx') and player then
        return player.Functions.GetMoney(account == 'cash' and 'cash' or 'bank') or 0
    elseif Framework == 'esx' and player then
        if account == 'cash' then
            return player.getMoney() or 0
        end
        local acc = player.getAccount('bank')
        return acc and acc.money or 0
    end
    return 0
end

local function removeMoney(src, player, account, amount, reason)
    if (Framework == 'qb' or Framework == 'qbx') and player then
        return player.Functions.RemoveMoney(account == 'cash' and 'cash' or 'bank', amount, reason) and true or false
    elseif Framework == 'esx' and player then
        if account == 'cash' then
            if (player.getMoney() or 0) < amount then return false end
            player.removeMoney(amount, reason)
            return true
        end
        local acc = player.getAccount('bank')
        if not acc or acc.money < amount then return false end
        player.removeAccountMoney('bank', amount, reason)
        return true
    end
    return false
end

-- ============================ INVENTORY WRITE ============================

local function giveItem(src, player, item, amount, metadata)
    if not item then return true end
    amount = amount or 1

    if InventorySystem == 'ox' then
        return exports.ox_inventory:AddItem(src, item, amount, metadata) and true or false
    elseif InventorySystem == 'qs' then
        return exports['qs-inventory']:AddItem(src, item, amount, nil, metadata) ~= false
    elseif InventorySystem == 'codem' then
        return exports['codem-inventory']:AddItem(src, item, amount, nil, metadata) ~= false
    elseif InventorySystem == 'origen' then
        return exports.origen_inventory:AddItem(src, item, amount, nil, metadata) ~= false
    elseif InventorySystem == 'core' then
        return exports.core_inventory:addItem(src, item, amount, metadata, 'content') ~= false
    elseif InventorySystem == 'qb' then
        if Framework == 'qbx' then
            return exports.qbx_core:AddItem and exports.qbx_core:AddItem(src, item, amount, nil, metadata)
                or (player and player.Functions.AddItem(item, amount, nil, metadata)) and true or false
        end
        return player and player.Functions.AddItem(item, amount, nil, metadata) and true or false
    elseif InventorySystem == 'esx' then
        if player then
            player.addInventoryItem(item, amount)
            return true
        end
    end

    -- standalone / ismeretlen inventory: nincs tárgykiadás, csak esemény
    return true
end

-- ============================ PAYMENT ============================

local function chargePlayer(src, player, price, reason)
    if price <= 0 then return true end

    if Framework == 'standalone' or not player then
        -- Standalone: nincs pénzrendszer, a fizetést a szervered kezelheti ezen az eventen
        TriggerEvent('nexus-cityhall:server:standalonePayment', src, price, reason)
        return true
    end

    local order = Config.PaymentAccount
    if order == 'bank' then
        return removeMoney(src, player, 'bank', price, reason)
    elseif order == 'cash' then
        return removeMoney(src, player, 'cash', price, reason)
    end

    -- bank_then_cash
    if removeMoney(src, player, 'bank', price, reason) then return true end
    return removeMoney(src, player, 'cash', price, reason)
end

-- ============================ PAYLOAD ============================

local function buildPlayerPayload(src)
    local player = getPlayer(src)
    return {
        name = getName(src, player),
        citizenId = getIdentifier(src, player),
        bank = getMoney(src, player, 'bank'),
        cash = getMoney(src, player, 'cash'),
        framework = Framework,
        inventory = InventorySystem,
    }, player
end

-- ============================ EVENTS ============================

RegisterNetEvent('nexus-cityhall:server:requestPlayer', function()
    local src = source
    local payload = buildPlayerPayload(src)
    TriggerClientEvent('nexus-cityhall:client:openUi', src, payload)
end)

RegisterNetEvent('nexus-cityhall:server:requestService', function(requestId, data)
    local src = source

    local function respond(result)
        TriggerClientEvent('nexus-cityhall:client:serviceResult', src, requestId, result)
    end

    if type(data) ~= 'table' or type(data.serviceId) ~= 'string' then
        return respond({ success = false, message = 'Érvénytelen kérelem.' })
    end

    local service = Config.Services[data.serviceId]
    if not service then
        return respond({ success = false, message = 'Ismeretlen ügytípus.' })
    end

    -- Az árat MINDIG a szerver config adja, sosem a UI
    local price = service.price or 0
    local payload, player = buildPlayerPayload(src)

    if not chargePlayer(src, player, price, ('cityhall: %s'):format(service.label)) then
        payload = buildPlayerPayload(src)
        TriggerClientEvent('nexus-cityhall:client:notify', src, 'Nincs elég pénzed.', 'error')
        return respond({ success = false, message = 'Nincs elég pénzed a kérelemhez.', player = payload })
    end

    local metadata = {
        description = service.label,
        name = payload.name,
        citizenid = payload.citizenId,
        issued = os.date('%Y-%m-%d %H:%M'),
    }

    -- A UI-ban kitöltött és aláírt dokumentum adatai (ha van)
    if type(data.document) == 'table' then
        metadata.signedBy = data.document.signedBy
        metadata.signedAt = data.document.signedAt
        if type(data.document.values) == 'table' then
            metadata.form = data.document.values
        end
    end


    local ok = giveItem(src, player, service.item, 1, metadata)

    payload = buildPlayerPayload(src)

    if not ok then
        TriggerClientEvent('nexus-cityhall:client:notify', src, 'Nincs hely a tárolóban.', 'error')
        return respond({ success = false, message = 'Nincs hely a tárolóban.', player = payload })
    end

    TriggerEvent('nexus-cityhall:server:serviceCompleted', src, data.serviceId, service, payload)
    TriggerClientEvent('nexus-cityhall:client:notify', src,
        ('%s kiállítva · %s $'):format(service.label, price), 'success')

    respond({ success = true, message = ('%s kiállítva.'):format(service.label), player = payload })
end)

-- ============================ INIT ============================

CreateThread(function()
    Wait(500)
    detectFramework()
    detectInventory()
end)
