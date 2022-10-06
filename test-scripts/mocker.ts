import mocker from 'mocker-data-generator'

const user = {
    birthdate: {
        faker: 'date.past'
    },
    id: {
        chance: 'guid'
    },
    firstName: {
        faker: 'name.firstName'
    },
    lastName: {
        faker: 'name.lastName'
    },
    country: {
        faker: 'address.country'
    },
    createdAt: {
        faker: 'date.past'
    },
    nested: {
        foo: {
            faker: 'date.past'
        },
        bar: {
            chance: 'guid'
        }
    }
}


const m = mocker()
    .schema('users', user, 3);


console.log(JSON.stringify(m.buildSync()));