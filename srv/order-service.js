const cds = require("@sap/cds");

class OrderService extends cds.ApplicationService {
    init() {
        const { Orders, Books } = cds.entities("com.bookshop");

        // This handler should run before the creation of an order
        this.before("CREATE", "Orders", async (req) => {
            req.data.status = 0;
            const result = await SELECT`max(number) maxOrderNo`.from(Orders);
            req.data.number = result[0].maxOrderNo + 1;
        });

        // Implemantion of the cancel action
        this.on("cancel", "Orders", async (req) => {
            const orderId = req.params[0];
            const order = await SELECT(Orders, { ID: orderId }, "status");
            if (![0, 1].includes(order.status)) {
                req.reject(400, `Order with status ${order.status} cannot be cancelled`);
            }
            await UPDATE(Orders, { ID: orderId }).with({ status: -1 });
        });

        // Implemantion of the submit action
        this.on("submit", "Orders", async (req) => {
            const orderId = req.params[0];
            const order = await SELECT(Orders, { ID: orderId }, order => {
                order.status,
                order.items(item => {
                    item`*`,
                    item.book(book => {
                        book.ID,
                        book.stock
                    })
                })
            });
            if (order.status !== 0) {
                req.reject(400, `Order with status ${order.status} cannot be submitted`);
            }
            for (const item of order.items) {
                if (item.amount > item.book.stock) {
                    req.reject(400, `Order exceeds stock of book ${item.book.ID}`);
                }
                await UPDATE(Books, { ID: item.book.ID }).with`stock = stock - ${item.amount}`;
            }
            await UPDATE(Orders, { ID: orderId }).with({ status: 1 });

        });

        // Implemantion of the getTotal function
        this.on("getTotal", "Orders", async (req) => {
            const orderId = req.params[0];
            const orderWithItems = await SELECT.one.from(Orders, order => {
                order.items(item => {
                    item.amount, item.book`*`
                })
            }).where({ ID: orderId });

            const total = orderWithItems.items.reduce((prevSum, currentItem) => {
                return prevSum += (currentItem.amount * currentItem.book.price)
            }, 0);

            return roundToDecimalPlaces(total, 2);
        });

        // Implemantion of the cancel action
        this.on("massCancel", async () => {
            const result = await SELECT`count(*) as count`.from(Orders).where({ status: 3 });
            return result[0].count;
        });

        // Implemantion of the getNumberOfSubmittedOrders function
        this.on("getNumberOfSubmittedOrders", async (req) => {
            const cancelPomises = req.data.IDs.map(id => this.cancel("Orders", id));
            await Promise.all(cancelPomises);
            return cancelPomises.length;
        });

        return super.init();
    }
}

function roundToDecimalPlaces(number, places) {
    return parseFloat(number.toFixed(places));
}

module.exports = OrderService;