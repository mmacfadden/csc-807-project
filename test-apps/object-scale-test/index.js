function generateObject(breadth, depth, valueSize) {
  if (depth === 0) {
    return "x".repeat(valueSize);
  } else {
    const obj = {};
    for (let i = 0; i < breadth; i++) {
      obj[i] = generateObject(breadth, depth - 1, valueSize);
    }

    Object.freeze(obj);
    return obj;
  }
}

function generateObjects(breadthRange, depthRange, valueSizeRange) {
  const objects = [];
  for (let breadth = breadthRange.start; breadth <= breadthRange.end; breadth += breadthRange.step) {
    for (let depth = depthRange.start; depth <= depthRange.end; depth += depthRange.step) {
      for (let valueSize = valueSizeRange.start; valueSize <= valueSizeRange.end; valueSize += valueSizeRange.step) {
        const doc = generateObject(breadth, depth, valueSize);
        objects.push({
          breadth,
          depth,
          valueSize,
          doc
        });
      }
    }
  }
  return objects;
}

async function test(operationCount) {
  const breadthTests = generateObjects(
      {start: 0, end: 1000, step: 10},
      {start: 1, end: 1, step: 1},
      {start: 10, end: 10, step: 1});

  await executeTests(breadthTests, operationCount);

  const breadthSeries = breadthTests.map(t => {
    return [t.breadth, t.duration];
  });



  const depthTests = generateObjects(
      {start: 1, end: 1, step: 1},
      {start: 0, end: 100, step: 1},
      {start: 10, end: 10, step: 1});

  await executeTests(depthTests, operationCount);

  const depthSeries = depthTests.map(t => {
    return [t.depth, t.duration];
  });


  const valueTests = generateObjects(
      {start: 1, end: 1, step: 1},
      {start: 1, end: 1, step: 1},
      {start: 1, end: 1000, step: 10});

  await executeTests(valueTests, operationCount);

  const valueSeries = valueTests.map(t => {
    return [t.valueSize, t.duration];
  });


  depthSeries.sort((a, b) => a[0] - b[0]);
  renderChart("depthChart", "Object Depth vs. Time", "Object Depth", depthSeries);

  breadthSeries.sort((a, b) => a[0] - b[0]);
  renderChart("breadthChart", "Object Breadth vs. Time", "Object Breadth", breadthSeries);

  valueSeries.sort((a, b) => a[0] - b[0]);
  renderChart("valueChart", "Value Size vs. Time", "Value Size (Bytes)", valueSeries);
}

const objectStoreName = "test";

async function executeTests(tests, operationCount) {
  const db = await createDatabase();

  tests.forEach((test, i) => {

    const startTime = performance.now();

    const tx = db.transaction(objectStoreName, "readwrite");
    const store = tx.objectStore(objectStoreName);

    for (let j = 0; j < operationCount; j++) {
      const key = `key_${i}_${j}`;

      store.add(test.doc, key);
      store.get(key);

    }

    tx.commit();

    const endTime = performance.now();
    test.duration = (endTime - startTime) / operationCount;
  });
}

function createDatabase() {
  return new Promise((resolve, reject) => {
    // Let us open our database
    const openReq = window.indexedDB.open("testDb", 1);

    openReq.onsuccess = () => {
      resolve(openReq.result);
    };

    openReq.onerror = () => {
      reject(openReq.result);
    };

    openReq.onupgradeneeded = (event) => {
      const db = event.target.result;

      db.onerror = () => {
        console.log(db.error);
      };

      const req = db.createObjectStore(objectStoreName, {autoIncrement: true});

      req.onsuccess = () => {
        console.log("object store created");
      }
    };
  })
}

function renderChart(id, title, xAxisLabel, data) {
  Highcharts.chart(id, {

    title: {
      text: title
    },
    yAxis: {
      title: {
        text: 'Avg Read-Write Time (ms)'
      }
    },

    xAxis: {
      title: {
        text: xAxisLabel
      }
    },

    plotOptions: {
      series: {
        label: {
          enabled: false
        }
      }
    },
    legend: {
      enabled: false
    },
    series: [{
      name: xAxisLabel,
      data
    }],

    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          }
        }
      }]
    }
  });
}

test(1000);
