async function loadEarnings(){

    try{

        const res = await fetch(
            "http://localhost:8080/api/retailer-earnings",
            {
                headers:{
                    "Authorization":
                    "Bearer " + localStorage.getItem("token")
                }
            }
        );


        const data = await res.json();

const ctx = document.getElementById("orderChart");

new Chart(ctx, {

    type: "bar",

    data: {

        labels: [
            "Confirmed Orders",
            "Pending Orders",
            "Cancelled Orders"
        ],

        datasets: [{

            label: "Orders",

            data: [
                data.confirmedOrders,
                data.pendingOrders,
                data.cancelledOrders
            ],

            borderWidth: 1

        }]

    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                display: false
            }

        },

        scales: {

            y: {

                beginAtZero: true,

                ticks: {
                    stepSize: 1
                }

            }

        }

    }

});

        console.log(data);


        document.getElementById("totalRevenue").innerText =
        "₹" + data.totalRevenue;


        document.getElementById("totalOrders").innerText =
        data.totalOrders;


        document.getElementById("averageOrder").innerText =
        "₹" + data.averageOrderValue;


        document.getElementById("confirmedOrders").innerText =
        data.confirmedOrders;


        document.getElementById("pendingOrders").innerText =
        data.pendingOrders;


        document.getElementById("cancelledOrders").innerText =
        data.cancelledOrders;


    }
    catch(err){

        console.log("Earnings Error:", err);

    }

}


loadEarnings();