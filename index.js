const esl = require('modesl')
const mysql = require('mysql')

const pool = mysql.createPool({
    connectionLimit : 10,
    host:'54.233.223.179',
    user: 'root',
    password: '190790edu',
    database: 'astpp'
})

let conn = null
waitTime = 20000

let doConnect = () => {
    conn = new esl.Connection('127.0.0.1', 8021, 'ClueCon', function() {
        conn.events('json', 'all')
    
        conn.on('esl::event::CHANNEL_HANGUP_COMPLETE::*', function(e) {
            if(e.getHeader('Call-Direction') == 'inbound'){

                insert = [e.getHeader('Unique-ID'), e.getHeader('variable_sip_contact_user'), e.getHeader('variable_sip_h_P-CostCenter')]

                pool.query('INSERT INTO astpp_basix (uniqueid, user, cost_center) values ?', [insert], (error, results) => {
                    if(error){
                        console.error(insert)
                    }
                })
            }
        })

        conn.on('error', (error) => {
            console.log('caiu')
            let data = new Date()
            console.log(`${error.code} - ${data.toLocaleString()}`)
            setTimeout(doConnect, waitTime)
        })

        conn.on('esl::event::disconnect::notice', () => {
            let data = new Date()
            console.log(`desconectou - ${data.toLocaleString()}`)
            setTimeout(doConnect, waitTime)
        })
    })
}

doConnect()

process.on('uncaughtException', function (err) {
    let data = new Date()
    console.log(`${err.code} - ${data.toLocaleString()}`)
    setTimeout(doConnect, waitTime)
})