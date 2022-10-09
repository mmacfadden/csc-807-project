import {EIDBFactory, EncryptionConfigManager, ModuleClearText} from "../src/";
import "fake-indexeddb/auto";


const dbFactory = indexedDB;

const dbName = "test";
const employeeId = new TextEncoder().encode('23404');

function openDatabase() {
    const request = dbFactory.open(dbName);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        console.log("Upgrade Needed");
        console.log(request.source);
        const db: IDBDatabase = request.result;
        if (!db.objectStoreNames.contains('employees')) {
            db.createObjectStore('employees', {keyPath: 'id'});
        }
    }

    request.onsuccess = (response) => {
        const db: IDBDatabase = request.result;
        addEmployee(db);
    }
}


function addEmployee(db: IDBDatabase) {
    let transaction = db.transaction("employees", "readwrite");
    let employees = transaction.objectStore("employees");

    let employee = {
        id: employeeId,
        firstName: "Michael",
        lastName: "MacFadden",
        ssn: "838-23-23434"
    };

    const req = employees.add(employee);
    req.onsuccess = function () { // (4)
        const getReq = employees.get(employee.id);
        getReq.onsuccess = () => {
            console.log(getReq.result);
            getEmployee(db);
        }
    };
    req.onerror = function () {
        console.log("Error", req.error);
    };
}

function getEmployee(db: IDBDatabase) {
    let transaction = db.transaction("employees", "readwrite");
    let employees = transaction.objectStore("employees");

    const req = employees.get(employeeId);
    req.onsuccess = () => {
        console.log(req.result);
        deleteDatabase();
    }

    req.onerror = () => {
        console.error(req.error);
    }
}

function deleteDatabase() {
    const deleteRequest = dbFactory.deleteDatabase(dbName);

    deleteRequest.onsuccess = () => {
        console.log("database deleted");
    }

    deleteRequest.onerror = (e) => {
        console.log("could not delete", e);
    }

    deleteRequest.onblocked = (e) => {
        //console.log("blocked", e);
    }
}

openDatabase();
