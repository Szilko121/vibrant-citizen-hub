Config = {}

-- 'auto' = automatikus felismerés (qbx_core / qb-core / es_extended / standalone)
Config.Framework = 'auto'

-- 'auto' = automatikus felismerés (ox_inventory, qb-inventory, qs-inventory,
-- codem-inventory, core_inventory, origen_inventory, ps-inventory, esx default)
Config.Inventory = 'auto'

-- Honnan vonjuk le a pénzt: 'bank', 'cash', vagy 'bank_then_cash'
Config.PaymentAccount = 'bank_then_cash'

-- Megnyitás
Config.OpenCommand = 'varoshaza'
Config.OpenKey = nil -- pl. 'F6' vagy hagyd nil-en

-- Városháza pult helye (a marker/interakció itt jelenik meg)
Config.Locations = {
    vector3(-545.15, -204.25, 38.22),
}
Config.InteractDistance = 2.0
Config.DrawMarker = true

Config.Notify = true

-- Szolgáltatások. Az `id` MEGEGYEZIK a UI-ban használt azonosítókkal.
-- item = nil esetén nem ad tárgyat, csak levonja a pénzt (és eventet triggerel).
Config.Services = {
    -- Személyes okmányok
    szemelyi     = { label = 'Személyi igazolvány',      price = 3000,  item = 'id_card' },
    lakcim       = { label = 'Lakcímkártya',             price = 1500,  item = 'address_card' },
    anyakonyv    = { label = 'Anyakönyvi kivonat',       price = 800,   item = 'birth_certificate' },
    nevvaltas    = { label = 'Névváltoztatás',           price = 5000,  item = nil },

    -- Autó ügyintézés
    jogositvany  = { label = 'Vezetői engedély',         price = 4500,  item = 'driver_license' },
    atiras       = { label = 'Jármű átírás',             price = 2500,  item = nil },
    forgalmi     = { label = 'Forgalmi engedély pótlás', price = 1200,  item = 'vehicle_registration' },
    rendszam     = { label = 'Egyedi rendszám',          price = 15000, item = nil },

    -- Engedélyek
    fegyver      = { label = 'Fegyvertartási engedély',  price = 25000, item = 'weaponlicense' },
    vadasz       = { label = 'Vadászengedély',           price = 12000, item = 'hunting_license' },
    pilota       = { label = 'Pilóta engedély',          price = 40000, item = 'pilot_license' },
    halasz       = { label = 'Horgászengedély',          price = 3500,  item = 'fishing_license' },
}
