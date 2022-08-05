const table = require('cakebase');
const found = table("./found.json");
const customers = table("./data.json");


found.get(obj => obj.customer != '').then(async foundCustomers => {
    for (const foundCustomer of foundCustomers) {
        let done = await customers.update(obj => obj.customer === foundCustomer.customer, foundCustomer);
        let done2 = await found.remove(obj => obj.customer === foundCustomer.customer);        
    }         
})






