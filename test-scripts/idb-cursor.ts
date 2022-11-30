import "fake-indexeddb/auto";

const openReq = indexedDB.open("test");
const STORE_NAME = "cursor_test";

openReq.onsuccess = () => {
  const db = openReq.result;
}

openReq.onupgradeneeded = () => {
  const db = openReq.result;
  const store = db.createObjectStore(STORE_NAME, {keyPath: "id"});

  store.add({id: "1", name: "tim"});
  store.add({id: "2", name: "jim"});
  store.add({id: "3", name: "tom"});
  store.add({id: "4", name: "jon"});

  const cursorRequest = store.openCursor();
  cursorRequest.onsuccess = () => {
    if (cursorRequest.result) {
      console.log(cursorRequest.result.primaryKey);
      cursorRequest.result.continue();
    }

  }
}