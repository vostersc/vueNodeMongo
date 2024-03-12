// customer-list.js
Vue.component('customer-list', {
    data() {
      return {
        customers: [],
        filteredCustomers: [],
        filterText: '',
        sortBy: '',
        sortDesc: false
      }
    },
    mounted() {
      this.fetchCustomers();
    },
    methods: {
      fetchCustomers() {
        axios.get('/customers')
          .then(response => {
            this.customers = response.data.map(el => ({...el, phone: this.formatPhoneNumber(el.phone)}));
            this.filteredCustomers = this.customers;
          })
          .catch(error => {
            console.error('Error fetching customers:', error);
          });
      },
      sortByColumn(column) {
        if (this.sortBy === column) {
          this.sortDesc = !this.sortDesc;
        } else {
          this.sortBy = column;
          this.sortDesc = false;
        }
        this.filteredCustomers.sort((a, b) => {
          let aValue = a[column];
          let bValue = b[column];
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          return this.sortDesc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
        });
      },
      filterCustomers() {
        if (!this.filterText) {
          this.filteredCustomers = this.customers;
        } else {
          this.filteredCustomers = this.customers.filter(customer => {
            const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
            const filterLowerCase = this.filterText.toLowerCase();
            return fullName.includes(filterLowerCase) ||
                   customer.phone.includes(filterLowerCase) ||
                   customer.email.includes(filterLowerCase);
          });
        }
      },
      formatPhoneNumber(phone) {
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      }
    },
    watch: {
      filterText() {
        this.filterCustomers();
      }
    },
    template: `
      <div>
        <input type="text" v-model="filterText" placeholder="Filter customers">
        <table>
          <thead>
            <tr>
                <th
                    @click="sortByColumn('firstName')"
                    style="cursor: pointer; min-width: 150px;"
                >
                    First Name
                </th>
                <th
                    @click="sortByColumn('lastName')"
                    style="cursor: pointer; min-width: 150px;"
                >
                    Last Name
                </th>
                <th
                    @click="sortByColumn('phone')"
                    style="cursor: pointer; min-width: 150px;"
                >
                    Phone
                </th>
                <th
                    @click="sortByColumn('email')"
                    style="cursor: pointer; min-width: 150px;"
                >
                    Email
                </th>
                <th
                    style="min-width: 150px;"
                >
                    Action
                </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in filteredCustomers" :key="customer._id">
              <td
                style="min-width: 150px; text-align: center;"
              >
                {{ customer.firstName }}</td>
              <td
                style="min-width: 150px; text-align: center;"
              >
                {{ customer.lastName }}</td>
              <td
                style="min-width: 150px; text-align: center;"
              >
                {{ customer.phone }}</td>
              <td
                style="min-width: 150px; text-align: center;"
              >
                {{ customer.email }}</td>
              <td
                style="min-width: 150px; text-align: center;"
              ><!-- Action column content --></td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  });
  
  new Vue({
    el: '#app'
  });
  