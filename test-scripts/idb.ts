import {EIDBFactory} from "../src/";
import "fake-indexeddb/auto";

const dbFactory = new EIDBFactory();

const dbName = "test";

const request = dbFactory.open(dbName);

request.onsuccess = (response) => {
    const db:IDBDatabase = request.result;
    printdbs();

    db.onclose = () => {
        console.log("db closed");
    }

    db.onerror = () => {
        console.log("db error");
    }

    db.onversionchange = () => {
        console.log("db version change");
    }

    db.onabort = () => {
        console.log("db abort");
    }

    db.close();

    setTimeout(deleteDatabase, 1000);
}

function deleteDatabase() {
    const deleteRequest = dbFactory.deleteDatabase(dbName);

    deleteRequest.onsuccess = () => {
        console.log("database deleted");
        printdbs();
    }

    deleteRequest.onerror = (e) => {
        console.log("could not delete", e);
    }

    deleteRequest.onblocked = (e) => {
        console.log("blocked", e);
        printdbs();
    }
}

function printdbs() {
    dbFactory.databases().then(t => {
        console.log(t);

    });
}