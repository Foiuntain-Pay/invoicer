/*************************************************************************
INVOICE TABLE
*************************************************************************/

export default function(sequelize: {
        define: (arg0: string, arg1: {
            invoiceNumber: { type: any; allowNull: boolean; }; subTotal: { type: any; allowNull: boolean; }; discount: { type: any; allowNull: boolean; }; tax: { type: any; allowNull: boolean; }; shipping: { type: any; allowNull: boolean; }; amount: { type: any; allowNull: boolean; }; amountPaid: { type: any; allowNull: boolean; }; balance: { type: any; allowNull: boolean; }; currency: {
                type: any; allowNull: boolean; validate: {
                    len: number[]; // must be between 1 and 3.
                };
            }; file: { type: any; allowNull: boolean; }; dueAt: { type: any; allowNull: boolean; }; status: { type: any; defaultValue: string; }; businessId: { type: any; }; clientId: { type: any; }; userId: { type: any; };
        }, arg2: { freezeTableName: boolean; }) => any;
    }, Sequelize: { STRING: any; DOUBLE: any; DATE: any; ENUM: (arg0: string, arg1: string) => any; INTEGER: any; }) {
    const Invoices = sequelize.define('invoices', {
        invoiceNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        subTotal: {
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        discount: {
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        tax: {
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        shipping: {
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        amount: {
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        amountPaid: {
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        balance: {
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        currency: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                len: [1, 3] // must be between 1 and 3.
            }
        },
        file: {
            type: Sequelize.STRING,
            allowNull: true
            
        },
        dueAt: {
            type: Sequelize.DATE,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('draft', 'published'),
            defaultValue: 'draft'
        },
        businessId: {
            type: Sequelize.INTEGER
        },
        clientId: {
            type: Sequelize.INTEGER
        },
        userId: {
            type: Sequelize.INTEGER
        },
        
    }, {
        freezeTableName: true
    });

    Invoices.associate = function(models: { invoices: { belongsTo: (arg0: any, arg1: { onDelete: string; targetKey: string; foreignKey: string; }) => void; hasMany: (arg0: any, arg1: { onDelete: string; targetKey: string; foreignKey: string; }) => void; }; users: any; clients: any; businesses: any; items: any; invoicePdfs: any; }) {
        models.invoices.belongsTo(models.users, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'userId'});
        models.invoices.belongsTo(models.clients, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'clientId'});
        models.invoices.belongsTo(models.businesses, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'businessId'});
        models.invoices.hasMany(models.items, {onDelete: 'cascade',targetKey: "id", foreignKey: 'invoiceId'});
        models.invoices.hasMany(models.invoicePdfs, {onDelete: 'cascade',targetKey: "id", foreignKey: 'invoiceId'});
    };

    return Invoices;

}