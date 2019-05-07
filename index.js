const esl = require("modesl");
const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 3,
  host: "127.0.0.1",
  user: "root",
  password: "5d5rBFA2bNugYDss",
  database: "astpp"
});

let conn = null;
waitTime = 20000;

function forceGC() {
  if (global.gc) {
    global.gc();
  } else {
    console.warn(
      "No GC hook! Start your program as `node --expose-gc file.js`."
    );
  }
}

let doConnect = () => {
  conn = new esl.Connection("127.0.0.1", 8021, "ClueCon", function() {
    //conn.events("json", "all");
    conn.events("json", "CHANNEL_HANGUP_COMPLETE");

    conn.on("esl::event::CHANNEL_HANGUP_COMPLETE::**", function(e) {
      if (
        e.getHeader("Call-Direction") == "inbound" &&
        e.getHeader("Caller-Network-Addr") == "54.207.81.171"
      ) {
        let insert = null;

        const centroCusto = e.getHeader("variable_sip_h_P-CostCenter");
        const userBasix = e.getHeader("variable_sip_h_P-Basix-User");

        if (centroCusto && userBasix) {
          insert = [e.getHeader("Unique-ID"), userBasix, centroCusto];
        } else {
          insert = [e.getHeader("Unique-ID"), userBasix, ""];
        }

        pool.query(
          "INSERT INTO astpp_basix (uniqueid, user, cost_center) values (?)",
          [insert],
          (error, results) => {
            if (error) {
              console.error(insert);
              console.error(error);
            }

            console.log(insert);

            //forceGC();
          }
        );
      }
    });

    conn.on("error", error => {
      console.log("caiu");
      let data = new Date();
      console.log(`${error.code} - ${data.toLocaleString()}`);
      setTimeout(doConnect, waitTime);
    });

    conn.on("esl::event::disconnect::notice", () => {
      let data = new Date();
      console.log(`desconectou - ${data.toLocaleString()}`);
      setTimeout(doConnect, waitTime);
    });
  });
};

doConnect();

process.on("uncaughtException", function(err) {
  let data = new Date();
  console.log(`${err.code} - ${data.toLocaleString()}`);
  setTimeout(doConnect, waitTime);
});
