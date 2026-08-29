local uiOpen = false
local pending = {}

local function notify(msg, kind)
    if not Config.Notify then return end
    if GetResourceState('ox_lib') == 'started' and lib then
        lib.notify({ description = msg, type = kind or 'inform' })
        return
    end
    SetNotificationTextEntry('STRING')
    AddTextComponentSubstringPlayerName(msg)
    DrawNotification(false, true)
end

local function setUi(state, player)
    uiOpen = state
    SetNuiFocus(state, state)
    if state then
        SendNUIMessage({ action = 'open', data = { player = player } })
    else
        SendNUIMessage({ action = 'close', data = {} })
    end
end

local function openUi()
    if uiOpen then return end
    TriggerServerEvent('nexus-cityhall:server:requestPlayer')
end

RegisterNetEvent('nexus-cityhall:client:openUi', function(player)
    setUi(true, player)
end)

RegisterNetEvent('nexus-cityhall:client:updatePlayer', function(player)
    SendNUIMessage({ action = 'updatePlayer', data = player })
end)

RegisterNetEvent('nexus-cityhall:client:notify', function(msg, kind)
    notify(msg, kind)
end)

RegisterNetEvent('nexus-cityhall:client:serviceResult', function(requestId, result)
    local cb = pending[requestId]
    if not cb then return end
    pending[requestId] = nil
    cb(result)
end)

RegisterNUICallback('closeUi', function(_, cb)
    setUi(false)
    cb({ ok = true })
end)

RegisterNUICallback('requestService', function(data, cb)
    local requestId = ('%d-%d'):format(GetGameTimer(), math.random(100000, 999999))
    local answered = false

    pending[requestId] = function(result)
        if answered then return end
        answered = true
        cb(result)
    end

    TriggerServerEvent('nexus-cityhall:server:requestService', requestId, data)

    -- Biztonsági időtúllépés, hogy a UI ne ragadjon be
    SetTimeout(10000, function()
        if pending[requestId] then
            pending[requestId] = nil
            if not answered then
                answered = true
                cb({ success = false, message = 'A szerver nem válaszolt.' })
            end
        end
    end)
end)

RegisterCommand(Config.OpenCommand, function()
    openUi()
end, false)

if Config.OpenKey then
    RegisterKeyMapping(Config.OpenCommand, 'Városháza megnyitása', 'keyboard', Config.OpenKey)
end

-- Marker + interakció a városházán
CreateThread(function()
    while true do
        local wait = 1000
        local coords = GetEntityCoords(PlayerPedId())

        for _, loc in ipairs(Config.Locations) do
            local dist = #(coords - loc)
            if dist < 15.0 then
                wait = 0
                if Config.DrawMarker then
                    DrawMarker(2, loc.x, loc.y, loc.z, 0, 0, 0, 0, 0, 0, 0.25, 0.25, 0.15,
                        220, 170, 90, 160, false, true, 2, false, nil, nil, false)
                end
                if dist < Config.InteractDistance and not uiOpen then
                    BeginTextCommandDisplayHelp('STRING')
                    AddTextComponentSubstringPlayerName('~INPUT_CONTEXT~ Ügyintézés')
                    EndTextCommandDisplayHelp(0, false, true, -1)
                    if IsControlJustReleased(0, 38) then
                        openUi()
                    end
                end
            end
        end

        Wait(wait)
    end
end)

-- ESC bezárás játékon belül
CreateThread(function()
    while true do
        if uiOpen then
            if IsControlJustReleased(0, 200) then
                setUi(false)
            end
            Wait(0)
        else
            Wait(250)
        end
    end
end)

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() and uiOpen then
        SetNuiFocus(false, false)
    end
end)
