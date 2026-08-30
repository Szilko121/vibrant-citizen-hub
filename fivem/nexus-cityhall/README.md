# nexus-cityhall (FiveM resource)

Városháza NUI ügyintézés. Automatikusan felismeri a frameworköt és az inventoryt — nem kell semmit átírni.

## Telepítés

1. Buildeld a felületet a projekt gyökeréből:

   ```bash
   bun install
   bun run build
   ```

2. Másold a `nexus-cityhall` mappát a `resources/[nexus]/` alá.
3. A build kimenetét (a statikus fájlokat: `index.html`, `assets/`) tedd ide:
   `nexus-cityhall/html/`
   Ügyelj rá, hogy a `html/index.html` létezzen (ezt hívja a `ui_page`).
4. `server.cfg`:

   ```cfg
   ensure nexus-cityhall
   ```

## Használat

- Parancs: `/varoshaza`
- Vagy állj a városháza pulthoz (`Config.Locations`) és nyomd meg az `E`-t.
- Bezárás: `ESC`.

## Automatikus felismerés

| Framework | Erre figyel |
| --- | --- |
| QBox | `qbx_core` |
| QBCore | `qb-core` |
| ESX | `es_extended` |
| Standalone | ha egyik sincs |

| Inventory | Erre figyel |
| --- | --- |
| ox_inventory | `ox_inventory` |
| qs-inventory | `qs-inventory` |
| codem-inventory | `codem-inventory` |
| origen_inventory | `origen_inventory` |
| core_inventory | `core_inventory` |
| qb / ps-inventory | `qb-inventory`, `ps-inventory` |
| ESX default | ESX esetén fallback |

Kényszerítheted is: `Config.Framework = 'qbx' | 'qb' | 'esx' | 'standalone'`,
`Config.Inventory = 'ox' | 'qb' | 'qs' | 'codem' | 'origen' | 'core' | 'esx' | 'none'`.

## Pénzlevonás

- `Config.PaymentAccount`: `'bank'`, `'cash'` vagy `'bank_then_cash'` (alapértelmezett).
- Az árat **mindig a szerver** `Config.Services` értéke határozza meg, a UI-ból küldött ár figyelmen kívül marad (anti-cheat).
- A játékos neve, azonosítója és egyenlege a szerverről érkezik, és minden tranzakció után frissül a felületen.

## Tárgyak

`Config.Services[<id>].item` — állítsd a saját item-neveidre (`items.lua` / `ox_inventory/data/items.lua`).
`item = nil` esetén nem ad tárgyat, csak fizet és eventet triggerel.

## Beépülési pontok (saját scriptekhez)

```lua
-- sikeres ügyintézés után
AddEventHandler('nexus-cityhall:server:serviceCompleted', function(src, serviceId, service, player)
    -- pl. rendszám regisztrálás, névváltás mentése DB-be
end)

-- standalone módban a fizetés a te rendszereden fut
AddEventHandler('nexus-cityhall:server:standalonePayment', function(src, price, reason)
end)
```
