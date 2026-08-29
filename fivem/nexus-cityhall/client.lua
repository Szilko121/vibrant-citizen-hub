local uiOpen = false

local function notify(msg, type)
    if not Config.Notify then return end
    if GetResourceState('ox_lib') == 'started' and lib then
        lib.notify({ description = msg, type = type or 'inform' })
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
    local player = lib and nil or nil
    TriggerServerEvent('nexus-cityhall:server:requestPlayer')
end

RegisterNetEvent('nexus-cityhall:client:openUi', function(player)
    setUi(true, player)
end)

RegisterNetEvent('nexus-cityhall:client:updatePlayer', function(player)
    SendNUIMessage({ action = 'updatePlayer', data = player })
end)

RegisterNetEvent('nexus-cityhall:client:notify', function(msg, type)
    notify(msg, type)
end)

RegisterNUICallback('closeUi', function(_, cb)
    setUi(false)
    cb({ ok = true })
end)

RegisterNUICallback('requestService', function(data, cb)
    local p = promise.new()

    local id = ('%s:%s'):format(GetGameTimer(), math.random(100000, 999999))
    local handler
    handler = RegisterNetEvent('nexus-cityhall:client:serviceResult', function(reqId, result)
        if reqId ~= id then return end
        p:resolve(result)
    end)

    TriggerServerEvent('nexus-cityhall:server:requestService', id, data)

    local result = Citizen.Await(p)
    cb(result or { success = false, message = 'Időtúllépés.' })
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
        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)
        local near = false

        for _, loc in ipairs(Config.Locations) do
            local dist = #(coords - loc)
            if dist < 15.0 then
                near = true
                wait = 0
                if Config.DrawMarker then
                    DrawMarker(2, loc.x, loc.y, loc.z, 0, 0, 0, 0, 0, 0, 0.25, 0.25, 0.15,
                        220, 170, 90, 160, false, true, 2, nil, nil, false)
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

        if not near then wait = 1000 end
        Wait(wait)
    end
end)

CreateThread(function()
    while true do
        Wait(0)
        if uiOpen then
            if IsControlJustReleased(0, 200) then -- ESC
                setUi(false)
            end
        else
            Wait(250)
        end
    end
end)
