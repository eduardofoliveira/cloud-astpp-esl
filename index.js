const esl = require('modesl')
const mysql = require('mysql')
const axios = require('axios')

const pool = mysql.createPool({
    connectionLimit : 3,
    host:'127.0.0.1',
    user: 'root',
    password: '5d5rBFA2bNugYDss',
    database: 'astpp'
})

let conn = null
waitTime = 20000

function forceGC(){
    if (global.gc) {
       global.gc();
    } else {
       console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
    }
}

let doConnect = () => {
    conn = new esl.Connection('127.0.0.1', 8021, 'ClueCon', function() {
        conn.events('json', 'all')

        conn.on('esl::event::CHANNEL_BRIDGE::*', (event) => {
            if(event.getHeader('Caller-Network-Addr') === '187.32.166.162'){
                let call = {
                    evento: event.getHeader('Event-Name'),
                    callid: event.getHeader('Channel-Call-UUID'),
                    from: event.getHeader('Other-Leg-Caller-ID-Number'),
                    to: event.getHeader('Other-Leg-Callee-ID-Number')
                }

                axios.post('http://18.228.130.32/chamada/locus', {call})
            }
        })

        conn.on('esl::event::CHANNEL_HANGUP_COMPLETE::*', function(e) {
            if(e.getHeader('Caller-Network-Addr') === '187.32.166.162'){
                let call = {
                    evento: e.getHeader('Event-Name'),
                    callid: e.getHeader('Channel-Call-UUID'),
                    from: e.getHeader('Other-Leg-Caller-ID-Number'),
                    to: e.getHeader('Other-Leg-Callee-ID-Number')
                }

                axios.post('http://18.228.130.32/chamada/locus', {call})
            }

            if(e.getHeader('Call-Direction') == 'inbound' && (e.getHeader('Caller-Network-Addr') == '200.225.81.77' || e.getHeader('Caller-Network-Addr') == '18.217.251.102')){
                let insert = null


                if(e.getHeader('variable_sip_h_P-CostCenter')){
                    insert = [e.getHeader('Unique-ID'), e.getHeader('variable_sip_contact_user'), e.getHeader('variable_sip_h_P-CostCenter')]
                }else{
                    insert = [e.getHeader('Unique-ID'), e.getHeader('variable_sip_contact_user'), '']
                }
                
                //console.log(e)

                pool.query('INSERT INTO astpp_basix (uniqueid, user, cost_center) values (?)', [insert], (error, results) => {
                    if(error){
                        console.error(insert)
                        console.error(error)
                    }

                    forceGC()
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