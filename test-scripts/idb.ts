import {EIDBFactory} from "../src/";
import "fake-indexeddb/auto";

const dbFactory = new EIDBFactory();

const dbName = "test";

const request = dbFactory.open(dbName);

request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
    console.log("Upgrade Needed");
    console.log(request.source);
    const db:IDBDatabase = request.result;
    if (!db.objectStoreNames.contains('employees')) {
        db.createObjectStore('employees', {keyPath: 'id'});
    }
}

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

    let transaction = db.transaction("employees", "readwrite");
    let employees = transaction.objectStore("employees");

    let employee = {
        id: '23404',
        firstName: "Michael",
        lastName: "MacFadden",
        ssn: "838-23-23434"
    };

    let addReq = employees.add(employee);
    addReq.onsuccess = function() { // (4)
        console.log("employee added to the store", addReq.result);
        const getReq = employees.get(employee.id);
        getReq.onsuccess = (ev: Event) => {
            console.log(getReq.result);
        }
    };

    addReq.onerror = function() {
        console.log("Error", request.error);
    };



    db.close();

    setTimeout(deleteDatabase, 0);
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