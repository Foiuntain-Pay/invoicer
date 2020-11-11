/*************************************************************************
INVOICE TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    var Invoices = sequelize.define('invoices', {
        InvoiceNumber: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'invoiceNumber'
        },
        BillerCompanyName: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'billerCompanyName'
        },
        BillerCompanyAddress: {
            type: Sequelize.TEXT,
            allowNull: false,
            field: 'billerCompanyAddress'
        },
        BillerCompanyLogo: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'billerCompanyLogo'
        },
        BillerBankName: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'billerBankName',
        },
        BillerAccountNumber: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'billerAccountNumber',
            validate: {
                len: [3, 50] // must be between 3 and 50.
            }
        },
        RecipientCompanyName: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'recipientCompanyName'
        },
        RecipientCompanyAddress: {
            type: Sequelize.TEXT,
            allowNull: false,
            field: 'recipientCompanyAddress'
        },
        SubTotal: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'subTotal'
        },
        Discount: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'discount'
        },
        Tax: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'tax'
        },
        Shipping: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'shipping'
        },
        Amount: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'amount'
        },
        AmountPaid: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'amountPaid'
        },
        Balance: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'balance'
        },
        Currency: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'currency',
            validate: {
                len: [1, 3] // must be between 1 and 3.
            }
        },
        File: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'file'
            
        },
        DueAt: {
            type: Sequelize.DATE,
            allowNull: false,
            field: 'dueAt'
        },
        Status: {
            type: Sequelize.ENUM('draft', 'unpaid', 'paid'),
            field: 'status',
            defaultValue: 'draft'
        },
        BusinessId: {
            type: Sequelize.INTEGER,
            field: 'businessId'
        },
        UserID: {
            type: Sequelize.STRING,
            field: 'userId'
        },
        UserName: {
            type: Sequelize.STRING,
            field: 'UserName'
        },
        RoleLevel: {
            type: Sequelize.INTEGER,
            field: 'roleLevel'
        },
        RoleName: {
            type: Sequelize.STRING,
            field: 'roleName'
        },
        DepartmentName: {
            type: Sequelize.STRING,
            field: 'departmentName'
        },
        Email: {
            type: Sequelize.STRING,
            field: 'email'
        },
        
    }, {
        freezeTableName: true
    });

    Invoices.associate = function(models) {
        models.invoices.hasMany(models.items, {onDelete: 'cascade',targetKey: "id", foreignKey: 'invoiceId'});
        models.invoices.hasMany(models.invoicePdfs, {onDelete: 'cascade',targetKey: "id", foreignKey: 'invoiceId'});
    };

    return Invoices;

}