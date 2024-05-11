const cds = require("@sap/cds");

class SupplyService extends cds.ApplicationService {
    async init() {
        const bupaService = await cds.connect.to("API_BUSINESS_PARTNER");

        this.on("READ", "Suppliers", (req) => {
            return bupaService.run(req.query);
        });

        this.on("READ", "Books", async (req, next) => {
            if (!req.query.SELECT.columns) return next();
            const expandIndex = req.query.SELECT.columns.findIndex(
                ({ expand, ref }) => expand && ref[0] === "supplier"
            );
            if (expandIndex < 0) return next();
    
            // Remove expand from query
            req.query.SELECT.columns.splice(expandIndex, 1);
    
            // Make sure supplier_ID will be returned
            if (!req.query.SELECT.columns.indexOf('*') >= 0 &&
                !req.query.SELECT.columns.find(
                    column => column.ref && column.ref.find((ref) => ref == "supplier_ID"))
            ) {
                req.query.SELECT.columns.push({ ref: ["supplier_ID"] });
            }
    
            const books = await next();
    
            // Request all associated suppliers
            const supplierIds = asArray(books).map(risk => risk.supplier_ID);
            const suppliers = await bupaService.run(SELECT.from('SupplyService.Suppliers').where({ ID: supplierIds }));
    
            // Convert in a map for easier lookup
            const suppliersMap = {};
            for (const supplier of suppliers)
                suppliersMap[supplier.ID] = supplier;
    
            // Add suppliers to result
            for (const note of asArray(books)) {
                note.supplier = suppliersMap[note.supplier_ID];
            }
    
            return books;
        });

        return super.init();
    }
}

const asArray = x => Array.isArray(x) ? x : [ x ];

module.exports = SupplyService;