import { text, relationship, password, timestamp, select, float, multiselect, virtual, checkbox } from "@keystone-6/core/fields";
import { denyAll } from "@keystone-6/core/access";
import type { Lists } from ".keystone/types";
import { graphql, list } from "@keystone-6/core";

export type Session = {
  itemId: string;
  data: {
    isBlocked: boolean;
    username: string;
    role: "admin" | "customer" | "employee" | "manager";
    permissions: any;
  };
};

function isAdmin({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can do anything
  if (session.data.role == "admin") return true;

  return !session.data.isBlocked;
}

function isManager({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can do anything
  if (session.data.role == "admin" || session.data.role == "manager") return true;

  return !session.data.isBlocked;
}

function isEmployee({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can do anything
  if (session.data.role == "employee" || session.data.role == "admin" || session.data.role == "manager") return true;

  return !session.data.isBlocked;
}

function isUser({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can do anything
  if (session.data.role == "employee" || session.data.role == "admin" || session.data.role == "manager" || session.data.role == "customer") return true;

  return !session.data.isBlocked;
}

export const lists: Lists = {
  User: list({
    ui: {
      labelField: "firstname",
    },
    access: {
      operation: {
        create: isAdmin,
        query: isUser,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      username: text({ validation: { isRequired: true }, isIndexed: "unique" }),
      email: text({
        isIndexed: "unique",
      }),
      isBlocked: checkbox({ defaultValue: false }),
      phone: text({ validation: { isRequired: false } }),
      firstname: text({ validation: { isRequired: true } }),
      lastname: text({ validation: { isRequired: false } }),
      role: select({
        type: "string",
        options: ["admin", "customer", "employee", "manager"],
        defaultValue: "customer",
        validation: { isRequired: true },
        isIndexed: true,
        access: {
          update: isAdmin,
        },
      }),
      permissions: multiselect({
        type: "enum",
        options: [
          { label: "Warranty", value: "warranty" },
          { label: "Price", value: "price" },
        ],
        access: {
          update: isAdmin,
        },
      }),
      ssid: text({ validation: { isRequired: false } }),
      password: password({
        validation: {
          isRequired: true,
          length: {
            min: 6,
          },
        },
      }),
      workOrders: relationship({ ref: "WorkOrder.creator", many: true }),
      clientOrders: relationship({ ref: "WorkOrder.customer", many: true }),
      applicationsToApply: relationship({
        ref: "Application.applicant",
        many: true,
      }),
      applications: relationship({
        ref: "Application.creator",
        many: true,
      }),
      notes: relationship({ ref: "Note.creator", many: true }),
      customerMovements: relationship({
        ref: "StockMovement.customer",
        many: true,
      }),
    },
  }),
  Note: list({
    ui: {
      labelField: "note",
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isManager,
        delete: isAdmin,
      },
    },
    fields: {
      note: text({ validation: { isRequired: true } }),
      workOrder: relationship({
        ref: "WorkOrder.notes",
        many: false,
      }),
      creator: relationship({
        ref: "User.notes",
        many: false,
      }),
    },
  }),
  File: list({
    ui: {
      labelField: "name",
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      url: text(),
      application: relationship({
        ref: "Application.images",
        many: false,
      }),
      workOrder: relationship({
        ref: "WorkOrder.images",
        many: false,
      }),
      product: relationship({
        ref: "Product.images",
        many: false,
      }),
    },
  }),
  WorkOrder: list({
    ui: {
      labelField: "createdAt",
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isEmployee,
        delete: isAdmin,
      },
    },
    fields: {
      creator: relationship({
        ref: "User.workOrders",
        many: false,
      }),
      createdAt: timestamp({
        defaultValue: { kind: "now" },
        isOrderable: true,
        access: {
          create: denyAll,
          update: denyAll,
        },
      }),
      images: relationship({
        ref: "File.workOrder",
        many: true,
      }),
      notes: relationship({
        ref: "Note.workOrder",
        many: true,
      }),
      status: select({
        type: "string",
        options: ["aktif", "pasif", "tamamlandı", "iptal", "teklif"],
        defaultValue: "pasif",
        validation: { isRequired: true },
        access: {
          update: isManager,
        },
      }),
      paymentPlan: relationship({
        ref: "PaymentPlan.workOrder",
        many: false,
      }),
      startedAt: virtual({
        field: graphql.field({
          type: graphql.String,
          async resolve(item, args, context) {
            try {
              const applications = await context.query.Application.findMany({
                where: { workOrder: { id: { equals: item.id } } },
                query: "startedAt",
              });
              let earliestStart = applications.at(0)!.startedAt;
              applications.forEach((app) => {
                if (app.startedAt < earliestStart) {
                  earliestStart = app.startedAt;
                }
              });
              return earliestStart;
            } catch (e) {
              console.log(e);
              return null;
            }
          },
        }),
      }),
      finishedAt: virtual({
        field: graphql.field({
          type: graphql.String,
          async resolve(item, args, context) {
            try {
              const applications = await context.query.Application.findMany({
                where: { workOrder: { id: { equals: item.id } } },
                query: "finishedAt",
              });
              if (applications.every((app) => app.finishedAt)) {
                let latestFinish = applications.at(0)!.finishedAt;
                applications.forEach((app) => {
                  if (app.finishedAt > latestFinish) {
                    latestFinish = app.finishedAt;
                  }
                });
                return latestFinish;
              } else {
                return null;
              }
            } catch (e) {
              console.log(e);
              return null;
            }
          },
        }),
      }),
      car: relationship({
        ref: "Car.workOrders",
        many: false,
      }),
      customer: relationship({
        ref: "User.clientOrders",
        many: false,
      }),
      reduction: float({ validation: { isRequired: false, min: 0 } }),
      applications: relationship({
        ref: "Application.workOrder",
        many: true,
      }),
    },
  }),
  Application: list({
    ui: {
      labelField: "name",
    },
    hooks: {
      beforeOperation: async ({ operation, item, inputData, context }) => {
        if (operation === "update") {
          if (inputData.startedAt) {
            if (item.startedAt) {
              throw new Error("Application already started");
            }
            if (!inputData.applicant) {
              throw new Error("Applicant is required");
            }
          }
          if (inputData.finishedAt) {
            if (!item.startedAt) {
              throw new Error("Application not started");
            }
            if (!inputData.applicant) {
              throw new Error("Applicant is required");
            }
            if (item.finishedAt) {
              throw new Error("Application already finished");
            }
            if (inputData.finishedAt < item.startedAt) {
              throw new Error("Finish date cannot be before start date");
            }
            if (inputData.applicant.connect?.id != item.applicantId) {
              throw new Error("Applicant cannot be changed");
            }
          }
        } else if (operation === "delete") {
          const movements = await context.query.StockMovement.findMany({
            where: { application: { id: { equals: item.id } } },
            query: "id",
          });
          movements.forEach(async (movement) => {
            await context.query.StockMovement.deleteOne({
              where: { id: movement.id },
            });
          });
        }
      },
      afterOperation: async ({ operation, item, inputData, context }) => {
        if (operation === "create") {
          const generalStorage = await context.query.Storage.findMany({
            where: { name: { equals: "Genel" } },
            query: "id",
          });
          await context.query.StockMovement.createOne({
            data: {
              product: { connect: { id: item.productId } },
              storage: { connect: { id: generalStorage.at(0)!.id } },
              amount: item.amount,
              movementType: "çıkış",
              application: { connect: { id: item.id } },
            },
          });
        } else if (operation === "update") {
          if (inputData.wastage && inputData.wastage > (item.wastage ?? 0)) {
            const generalStorage = await context.query.Storage.findMany({
              where: { name: { equals: "Genel" } },
              query: "id",
            });
            const wastageStorage = await context.query.Storage.findMany({
              where: { name: { equals: "Fire" } },
              query: "id",
            });
            await context.query.StockMovement.createOne({
              data: {
                product: { connect: { id: item.productId } },
                storage: { connect: { id: wastageStorage.at(0)!.id } },
                amount: inputData.wastage - (item.wastage ?? 0),
                movementType: "giriş",
                application: { connect: { id: item.id } },
              },
            });
            await context.query.StockMovement.createOne({
              data: {
                product: { connect: { id: item.productId } },
                storage: { connect: { id: generalStorage.at(0)!.id } },
                amount: inputData.wastage - (item.wastage ?? 0),
                movementType: "çıkış",
                application: { connect: { id: item.id } },
              },
            });
          } else if (inputData.wastage && item.wastage && inputData.wastage < item.wastage) {
            const generalStorage = await context.query.Storage.findMany({
              where: { name: { equals: "Genel" } },
              query: "id",
            });
            const wastageStorage = await context.query.Storage.findMany({
              where: { name: { equals: "Fire" } },
              query: "id",
            });
            await context.query.StockMovement.createOne({
              data: {
                product: { connect: { id: item.productId } },
                storage: { connect: { id: wastageStorage.at(0)!.id } },
                amount: item.wastage - inputData.wastage,
                movementType: "çıkış",
                application: { connect: { id: item.id } },
              },
            });
            await context.query.StockMovement.createOne({
              data: {
                product: { connect: { id: item.productId } },
                storage: { connect: { id: generalStorage.at(0)!.id } },
                amount: item.wastage - inputData.wastage,
                movementType: "giriş",
                application: { connect: { id: item.id } },
              },
            });
          }
        }
      },
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isEmployee,
        delete: isEmployee,
      },
    },
    fields: {
      workOrder: relationship({
        ref: "WorkOrder.applications",
        many: false,
      }),
      images: relationship({
        ref: "File.application",
        many: true,
      }),
      startedAt: timestamp(),
      finishedAt: timestamp(),
      name: text({ validation: { isRequired: true } }),
      description: text({}),
      price: float({ validation: { isRequired: true, min: 0 } }),
      amount: float({ validation: { isRequired: true, min: 0 } }),
      wastage: float({ validation: { isRequired: false, min: 0 }, defaultValue: 0 }),
      location: relationship({
        ref: "ApplicationLocation.applications",
        many: false,
      }),
      product: relationship({
        ref: "Product.applications",
        many: false,
      }),
      applicant: relationship({
        ref: "User.applicationsToApply",
        many: false,
      }),
      creator: relationship({
        ref: "User.applications",
        many: false,
      }),
      type: relationship({
        ref: "ApplicationType.applications",
        many: false,
      }),
      stockMovements: relationship({
        ref: "StockMovement.application",
        many: true,
      }),
    },
  }),
  ApplicationType: list({
    ui: {
      labelField: "name",
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      applications: relationship({
        ref: "Application.type",
        many: true,
      }),
      products: relationship({
        ref: "Product.applicationType",
        many: true,
      }),
      locations: relationship({
        ref: "ApplicationLocation.applicationTypes",
        many: true,
      }),
    },
  }),
  Product: list({
    ui: {
      labelField: "name",
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      description: text({}),
      price: float({ validation: { isRequired: true, min: 0 } }),
      currentStock: virtual({
        field: graphql.field({
          type: graphql.Int,
          async resolve(item, args, context) {
            try {
              const generalStorage = await context.query.Storage.findMany({
                where: { name: { equals: "Genel" } },
                query: "id",
              });
              const movements = await context.query.StockMovement.findMany({
                where: { product: { id: { equals: item.id } }, storage: { id: { equals: generalStorage.at(0)!.id } } },
                query: "amount movementType",
              });
              let stock = 0;
              movements.forEach((movement) => {
                if (movement.movementType == "giriş") {
                  stock += movement.amount;
                } else {
                  stock -= movement.amount;
                }
              });
              return stock;
            } catch (e) {
              console.log(e);
              return 0;
            }
          },
        }),
      }),
      status: select({
        type: "string",
        options: ["aktif", "pasif", "iptal"],
        defaultValue: "aktif",
        validation: { isRequired: true },
      }),
      images: relationship({
        ref: "File.product",
        many: true,
      }),
      code: text({}),
      ean: text({}),
      productBrand: relationship({
        ref: "ProductBrand.products",
        many: false,
      }),
      pricedBy: select({
        type: "string",
        options: ["amount", "length"],
        defaultValue: "amount",
        validation: { isRequired: true },
      }),
      applications: relationship({
        ref: "Application.product",
        many: true,
      }),
      applicationType: relationship({
        ref: "ApplicationType.products",
        many: false,
      }),
      stockMovements: relationship({
        ref: "StockMovement.product",
        many: true,
      }),
      warrantyTime: float({ validation: { isRequired: false, min: 0 } }),
      color: text({}),
      width: float({}),
      length: float({}),
    },
  }),
  Storage: list({
    ui: {
      labelField: "name",
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      stockMovements: relationship({
        ref: "StockMovement.storage",
        many: true,
      }),
    },
  }),
  DocumentType: list({
    ui: {
      labelField: "name",
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      stockMovements: relationship({
        ref: "StockMovement.documentType",
        many: true,
      }),
    },
  }),
  StockMovement: list({
    ui: {
      labelField: "movementType",
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      product: relationship({
        ref: "Product.stockMovements",
        many: false,
      }),
      storage: relationship({
        ref: "Storage.stockMovements",
        many: false,
      }),
      amount: float({ validation: { isRequired: true, min: 0 } }),
      movementType: select({
        type: "string",
        options: ["giriş", "çıkış"],
        defaultValue: "giriş",
        validation: { isRequired: true },
      }),
      documentType: relationship({
        ref: "DocumentType.stockMovements",
        many: false,
      }),
      note: text({}),
      customer: relationship({
        ref: "User.customerMovements",
        many: false,
      }),
      date: timestamp({
        defaultValue: { kind: "now" },
        isOrderable: true,
      }),
      application: relationship({
        ref: "Application.stockMovements",
        many: false,
      }),

      createdAt: timestamp({
        defaultValue: { kind: "now" },
        isOrderable: true,
        access: {
          create: denyAll,
          update: denyAll,
        },
      }),
    },
  }),
  ProductBrand: list({
    ui: {
      labelField: "name",
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      products: relationship({ ref: "Product.productBrand", many: true }),
    },
  }),
  Car: list({
    ui: {
      labelField: "licensePlate",
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isEmployee,
        delete: isAdmin,
      },
    },
    fields: {
      vin: text(),
      carModel: relationship({
        ref: "CarModel.cars",
        many: false,
      }),
      licensePlate: text({ validation: { isRequired: true } }),
      workOrders: relationship({ ref: "WorkOrder.car", many: true }),
    },
  }),
  CarModel: list({
    ui: {
      labelField: "name",
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      cars: relationship({ ref: "Car.carModel", many: true }),
      carBrand: relationship({ ref: "CarBrand.carModels", many: false }),
    },
  }),
  CarBrand: list({
    ui: {
      labelField: "name",
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      carModels: relationship({ ref: "CarModel.carBrand", many: true }),
    },
  }),
  ApplicationLocation: list({
    ui: {
      labelField: "name",
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      applicationTypes: relationship({
        ref: "ApplicationType.locations",
        many: true,
      }),
      applications: relationship({
        ref: "Application.location",
        many: true,
      }),
    },
  }),
  PaymentPlan: list({
    ui: {
      labelField: "name",
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      workOrder: relationship({
        ref: "WorkOrder.paymentPlan",
        many: false,
      }),
      payments: relationship({
        ref: "Payment.paymentPlan",
        many: true,
      }),
      periods: float({ validation: { isRequired: true, min: 1 } }),
      toPay: virtual({
        field: graphql.field({
          type: graphql.Float,
          async resolve(item, args, context) {
            try {
              const payments = await context.query.PaymentPlanPayment.findMany({
                where: { paymentPlan: { id: { equals: item.id } } },
                query: "amount",
              });
              const workOrder = await context.query.WorkOrder.findMany({
                where: { paymentPlan: { id: { equals: item.id } } },
                query: "status applications { price }",
              });
              let total = 0;
              workOrder.forEach((order) => {
                total += order.applications.reduce((acc: any, app: { price: any }) => acc + app.price, 0);
              });
              let paymentTotal = 0;
              payments.forEach((payment) => {
                paymentTotal += payment.amount;
              });

              return total - paymentTotal;
            } catch (e) {
              console.log(e);
              return 123456;
            }
          },
        }),
      }),
      completed: virtual({
        field: graphql.field({
          type: graphql.Boolean,
          async resolve(item, args, context) {
            try {
              const payments = await context.query.PaymentPlanPayment.findMany({
                where: { paymentPlan: { id: { equals: item.id } } },
                query: "amount",
              });
              const workOrder = await context.query.WorkOrder.findMany({
                where: { paymentPlan: { id: { equals: item.id } } },
                query: "status applications { price }",
              });
              let total = 0;
              workOrder.forEach((order) => {
                total += order.applications.reduce((acc: any, app: { price: any }) => acc + app.price, 0);
              });
              let paymentTotal = 0;
              payments.forEach((payment) => {
                paymentTotal += payment.amount;
              });

              return total <= paymentTotal;
            } catch (e) {
              console.log(e);
              return false;
            }
          },
        }),
      }),
    },
  }),
  Payment: list({
    ui: {
      labelField: "date",
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isManager,
        delete: isManager,
      },
    },
    fields: {
      amount: float({ validation: { isRequired: true, min: 0 } }),
      paymentPlan: relationship({
        ref: "PaymentPlan.payments",
        many: false,
      }),
      reference: text({}),
      type: select({
        type: "string",
        options: ["nakit", "kredi kartı", "havale", "çek", "senet", "banka kartı"],
        defaultValue: "nakit",
        validation: { isRequired: true },
      }),
      date: timestamp({
        defaultValue: { kind: "now" },
        isOrderable: true,
      }),
    },
  }),
};
