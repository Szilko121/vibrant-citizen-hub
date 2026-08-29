fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'nexus-cityhall'
author 'Nexus Horizon RP'
description 'Városháza ügyintézés NUI (QBox / QBCore / ESX / Standalone auto-detect)'
version '1.0.0'

shared_scripts {
    'config.lua'
}

client_scripts {
    'client.lua'
}

server_scripts {
    'server.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/**/*'
}
