const esl = require('modesl')

let conn = null
waitTime = 20000

let doConnect = () => {
    conn = new esl.Connection('192.168.0.110', 8021, 'ClueCon', function() {
        conn.events('json', 'all')
        //conn.api('status', function(res) {
        //    //res is an esl.Event instance
        //    console.log(res.getBody())
        //})
        /*conn.on('esl::event::**', function(e) {
            console.log(e.getHeader('Event-Name'))
            console.log(e.getHeader('Core-UUID'))
            console.log(e.getHeader('Unique-ID'))
            console.log(e.getHeader('variable_sip_call_id'))
            console.log('')
        })*/
    
        conn.on('esl::event::CHANNEL_HANGUP_COMPLETE::*', function(e) {
            if(e.getHeader('Call-Direction') == 'inbound'){

                console.log(e.getHeader('Unique-ID'))
                console.log(e.getHeader('variable_sip_call_id'))
                console.log(e.getHeader('Hangup-Cause'))
                console.log(e.getHeader('variable_sip_hangup_disposition'))
                console.log(e.getHeader('Caller-Caller-ID-Name'))
                console.log(e.getHeader('Caller-Caller-ID-Number'))
                console.log(e.getHeader('variable_sip_contact_user'))
                console.log(e.getHeader('variable_sip_from_host'))
                console.log(e.getHeader('variable_sip_h_P-CostCenter'))
                console.log(e.getHeader('variable_last_arg'))

                if(e.getHeader('variable_sip_hangup_disposition') == 'recv_bye'){
                    console.log('Originador Desligou')
                }else{
                    console.log('Destino Desligou')
                }

                //e.headers.forEach(item => {
                //    console.log(item)
                //})

                console.log('')
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