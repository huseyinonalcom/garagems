"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// keystone.ts
var keystone_exports = {};
__export(keystone_exports, {
  default: () => keystone_default
});
module.exports = __toCommonJS(keystone_exports);

// auth.ts
var import_crypto = require("crypto");
var import_auth = require("@keystone-6/auth");
var import_session = require("@keystone-6/core/session");
var sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV !== "production") {
  sessionSecret = (0, import_crypto.randomBytes)(32).toString("hex");
}
var { withAuth } = (0, import_auth.createAuth)({
  listKey: "User",
  identityField: "username",
  sessionData: "id username role permissions isBlocked",
  secretField: "password",
  initFirstItem: {
    fields: ["username", "firstname", "role", "email", "password"]
  }
});
var sessionMaxAge = 60 * 60 * 24 * 30;
var session = (0, import_session.statelessSessions)({
  maxAge: sessionMaxAge,
  secret: sessionSecret
});

// keystone.ts
var import_core2 = require("@keystone-6/core");

// schema.ts
var import_fields = require("@keystone-6/core/fields");
var import_access = require("@keystone-6/core/access");
var import_core = require("@keystone-6/core");
function isAdmin({ session: session2 }) {
  if (!session2)
    return false;
  if (session2.data.role == "admin")
    return true;
  return !session2.data.isBlocked;
}
function isManager({ session: session2 }) {
  if (!session2)
    return false;
  if (session2.data.role == "admin" || session2.data.role == "manager")
    return true;
  return !session2.data.isBlocked;
}
function isEmployee({ session: session2 }) {
  if (!session2)
    return false;
  if (session2.data.role == "employee" || session2.data.role == "admin" || session2.data.role == "manager")
    return true;
  return !session2.data.isBlocked;
}
function isUser({ session: session2 }) {
  if (!session2)
    return false;
  if (session2.data.role == "employee" || session2.data.role == "admin" || session2.data.role == "manager" || session2.data.role == "customer")
    return true;
  return !session2.data.isBlocked;
}
var lists = {
  User: (0, import_core.list)({
    ui: {
      labelField: "firstname"
    },
    access: {
      operation: {
        create: isAdmin,
        query: isUser,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      username: (0, import_fields.text)({ validation: { isRequired: true }, isIndexed: "unique" }),
      email: (0, import_fields.text)({
        isIndexed: "unique"
      }),
      isBlocked: (0, import_fields.checkbox)({ defaultValue: false }),
      phone: (0, import_fields.text)({ validation: { isRequired: false } }),
      firstname: (0, import_fields.text)({ validation: { isRequired: true } }),
      lastname: (0, import_fields.text)({ validation: { isRequired: false } }),
      role: (0, import_fields.select)({
        type: "string",
        options: ["admin", "customer", "employee", "manager"],
        defaultValue: "customer",
        validation: { isRequired: true },
        isIndexed: true,
        access: {
          update: isAdmin
        }
      }),
      permissions: (0, import_fields.multiselect)({
        type: "enum",
        options: [
          { label: "Warranty", value: "warranty" },
          { label: "Price", value: "price" }
        ],
        access: {
          update: isAdmin
        }
      }),
      ssid: (0, import_fields.text)({ validation: { isRequired: false } }),
      password: (0, import_fields.password)({
        validation: {
          isRequired: true,
          length: {
            min: 6
          }
        }
      }),
      qcWorkOrders: (0, import_fields.relationship)({
        ref: "WorkOrder.qcUser",
        many: true
      }),
      workOrders: (0, import_fields.relationship)({ ref: "WorkOrder.creator", many: true }),
      clientOrders: (0, import_fields.relationship)({ ref: "WorkOrder.customer", many: true }),
      applicationsToApply: (0, import_fields.relationship)({
        ref: "Application.applicant",
        many: true
      }),
      applications: (0, import_fields.relationship)({
        ref: "Application.creator",
        many: true
      }),
      notes: (0, import_fields.relationship)({ ref: "Note.creator", many: true }),
      customerMovements: (0, import_fields.relationship)({
        ref: "StockMovement.customer",
        many: true
      })
    }
  }),
  Note: (0, import_core.list)({
    ui: {
      labelField: "note"
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isManager,
        delete: isAdmin
      }
    },
    fields: {
      note: (0, import_fields.text)({ validation: { isRequired: true } }),
      workOrder: (0, import_fields.relationship)({
        ref: "WorkOrder.notes",
        many: false
      }),
      creator: (0, import_fields.relationship)({
        ref: "User.notes",
        many: false
      })
    }
  }),
  File: (0, import_core.list)({
    ui: {
      labelField: "name"
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      url: (0, import_fields.text)(),
      application: (0, import_fields.relationship)({
        ref: "Application.images",
        many: false
      }),
      workOrder: (0, import_fields.relationship)({
        ref: "WorkOrder.images",
        many: false
      }),
      product: (0, import_fields.relationship)({
        ref: "Product.images",
        many: false
      })
    }
  }),
  WorkOrder: (0, import_core.list)({
    ui: {
      labelField: "createdAt"
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isEmployee,
        delete: isAdmin
      }
    },
    fields: {
      creator: (0, import_fields.relationship)({
        ref: "User.workOrders",
        many: false
      }),
      createdAt: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        isOrderable: true,
        access: {
          create: import_access.denyAll,
          update: import_access.denyAll
        }
      }),
      images: (0, import_fields.relationship)({
        ref: "File.workOrder",
        many: true
      }),
      notes: (0, import_fields.relationship)({
        ref: "Note.workOrder",
        many: true
      }),
      status: (0, import_fields.select)({
        type: "string",
        options: ["aktif", "pasif", "tamamland\u0131", "iptal", "teklif"],
        defaultValue: "pasif",
        validation: { isRequired: true },
        access: {
          update: isManager
        }
      }),
      paymentPlan: (0, import_fields.relationship)({
        ref: "PaymentPlan.workOrder",
        many: false
      }),
      qcDone: (0, import_fields.checkbox)({ defaultValue: false }),
      qcUser: (0, import_fields.relationship)({
        ref: "User.qcWorkOrders",
        many: false
      }),
      checkDate: (0, import_fields.timestamp)({
        validation: { isRequired: false }
      }),
      checkDone: (0, import_fields.checkbox)({ defaultValue: false }),
      notifications: (0, import_fields.relationship)({
        ref: "Notification.workOrder",
        many: true
      }),
      startedAt: (0, import_fields.virtual)({
        field: import_core.graphql.field({
          type: import_core.graphql.String,
          async resolve(item, args, context) {
            try {
              const applications = await context.query.Application.findMany({
                where: { workOrder: { id: { equals: item.id } } },
                query: "startedAt"
              });
              let earliestStart = applications.at(0).startedAt;
              applications.forEach((app) => {
                if (app.startedAt < earliestStart) {
                  earliestStart = app.startedAt;
                }
              });
              return earliestStart;
            } catch (e) {
              return null;
            }
          }
        })
      }),
      finishedAt: (0, import_fields.virtual)({
        field: import_core.graphql.field({
          type: import_core.graphql.String,
          async resolve(item, args, context) {
            try {
              const applications = await context.query.Application.findMany({
                where: { workOrder: { id: { equals: item.id } } },
                query: "finishedAt"
              });
              if (applications.every((app) => app.finishedAt)) {
                let latestFinish = applications.at(0).finishedAt;
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
              return null;
            }
          }
        })
      }),
      car: (0, import_fields.relationship)({
        ref: "Car.workOrders",
        many: false
      }),
      customer: (0, import_fields.relationship)({
        ref: "User.clientOrders",
        many: false
      }),
      reduction: (0, import_fields.float)({ validation: { isRequired: false, min: 0 } }),
      applications: (0, import_fields.relationship)({
        ref: "Application.workOrder",
        many: true
      })
    }
  }),
  Application: (0, import_core.list)({
    ui: {
      labelField: "name"
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
          if (inputData.wastage && inputData.wastage > (item.wastage ?? 0)) {
            const generalStorage = await context.query.Storage.findMany({
              where: { name: { equals: "Genel" } },
              query: "id"
            });
            const wastageStorage = await context.query.Storage.findMany({
              where: { name: { equals: "Fire" } },
              query: "id"
            });
            await context.query.StockMovement.createOne({
              data: {
                product: { connect: { id: item.productId } },
                storage: { connect: { id: wastageStorage.at(0).id } },
                amount: inputData.wastage - (item.wastage ?? 0),
                movementType: "giri\u015F",
                application: { connect: { id: item.id } }
              }
            });
            await context.query.StockMovement.createOne({
              data: {
                product: { connect: { id: item.productId } },
                storage: { connect: { id: generalStorage.at(0).id } },
                amount: inputData.wastage - (item.wastage ?? 0),
                movementType: "\xE7\u0131k\u0131\u015F",
                application: { connect: { id: item.id } }
              }
            });
          } else if (inputData.wastage && item.wastage && inputData.wastage < item.wastage) {
            const generalStorage = await context.query.Storage.findMany({
              where: { name: { equals: "Genel" } },
              query: "id"
            });
            const wastageStorage = await context.query.Storage.findMany({
              where: { name: { equals: "Fire" } },
              query: "id"
            });
            await context.query.StockMovement.createOne({
              data: {
                product: { connect: { id: item.productId } },
                storage: { connect: { id: wastageStorage.at(0).id } },
                amount: item.wastage - inputData.wastage,
                movementType: "\xE7\u0131k\u0131\u015F",
                application: { connect: { id: item.id } }
              }
            });
            await context.query.StockMovement.createOne({
              data: {
                product: { connect: { id: item.productId } },
                storage: { connect: { id: generalStorage.at(0).id } },
                amount: item.wastage - inputData.wastage,
                movementType: "giri\u015F",
                application: { connect: { id: item.id } }
              }
            });
          }
        } else if (operation === "delete") {
          const movements = await context.query.StockMovement.findMany({
            where: { application: { id: { equals: item.id } } },
            query: "id"
          });
          movements.forEach(async (movement) => {
            await context.query.StockMovement.deleteOne({
              where: { id: movement.id }
            });
          });
        }
      },
      afterOperation: async ({ operation, item, context }) => {
        if (operation === "create") {
          const generalStorage = await context.query.Storage.findMany({
            where: { name: { equals: "Genel" } },
            query: "id"
          });
          await context.query.StockMovement.createOne({
            data: {
              product: { connect: { id: item.productId } },
              storage: { connect: { id: generalStorage.at(0).id } },
              amount: item.amount,
              movementType: "\xE7\u0131k\u0131\u015F",
              application: { connect: { id: item.id } }
            }
          });
        }
      }
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isEmployee,
        delete: isEmployee
      }
    },
    fields: {
      workOrder: (0, import_fields.relationship)({
        ref: "WorkOrder.applications",
        many: false
      }),
      images: (0, import_fields.relationship)({
        ref: "File.application",
        many: true
      }),
      startedAt: (0, import_fields.timestamp)(),
      finishedAt: (0, import_fields.timestamp)(),
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      description: (0, import_fields.text)({}),
      price: (0, import_fields.float)({ validation: { isRequired: true, min: 0 } }),
      amount: (0, import_fields.float)({ validation: { isRequired: true, min: 0 } }),
      wastage: (0, import_fields.float)({ validation: { isRequired: false, min: 0 }, defaultValue: 0 }),
      location: (0, import_fields.relationship)({
        ref: "ApplicationLocation.applications",
        many: false
      }),
      product: (0, import_fields.relationship)({
        ref: "Product.applications",
        many: false
      }),
      applicant: (0, import_fields.relationship)({
        ref: "User.applicationsToApply",
        many: false
      }),
      creator: (0, import_fields.relationship)({
        ref: "User.applications",
        many: false
      }),
      type: (0, import_fields.relationship)({
        ref: "ApplicationType.applications",
        many: false
      }),
      stockMovements: (0, import_fields.relationship)({
        ref: "StockMovement.application",
        many: true
      })
    }
  }),
  ApplicationType: (0, import_core.list)({
    ui: {
      labelField: "name"
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      applications: (0, import_fields.relationship)({
        ref: "Application.type",
        many: true
      }),
      products: (0, import_fields.relationship)({
        ref: "Product.applicationType",
        many: true
      }),
      locations: (0, import_fields.relationship)({
        ref: "ApplicationLocation.applicationTypes",
        many: true
      })
    }
  }),
  Product: (0, import_core.list)({
    ui: {
      labelField: "name"
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      description: (0, import_fields.text)({}),
      price: (0, import_fields.float)({ validation: { isRequired: true, min: 0 } }),
      currentStock: (0, import_fields.virtual)({
        field: import_core.graphql.field({
          type: import_core.graphql.Int,
          async resolve(item, args, context) {
            try {
              const generalStorage = await context.query.Storage.findMany({
                where: { name: { equals: "Genel" } },
                query: "id"
              });
              const movements = await context.query.StockMovement.findMany({
                where: { product: { id: { equals: item.id } }, storage: { id: { equals: generalStorage.at(0).id } } },
                query: "amount movementType"
              });
              let stock = 0;
              movements.forEach((movement) => {
                if (movement.movementType == "giri\u015F") {
                  stock += movement.amount;
                } else {
                  stock -= movement.amount;
                }
              });
              return stock;
            } catch (e) {
              return 0;
            }
          }
        })
      }),
      status: (0, import_fields.select)({
        type: "string",
        options: ["aktif", "pasif", "iptal"],
        defaultValue: "aktif",
        validation: { isRequired: true }
      }),
      images: (0, import_fields.relationship)({
        ref: "File.product",
        many: true
      }),
      code: (0, import_fields.text)({}),
      ean: (0, import_fields.text)({}),
      productBrand: (0, import_fields.relationship)({
        ref: "ProductBrand.products",
        many: false
      }),
      pricedBy: (0, import_fields.select)({
        type: "string",
        options: ["amount", "length"],
        defaultValue: "amount",
        validation: { isRequired: true }
      }),
      applications: (0, import_fields.relationship)({
        ref: "Application.product",
        many: true
      }),
      applicationType: (0, import_fields.relationship)({
        ref: "ApplicationType.products",
        many: false
      }),
      stockMovements: (0, import_fields.relationship)({
        ref: "StockMovement.product",
        many: true
      }),
      warrantyTime: (0, import_fields.float)({ validation: { isRequired: false, min: 0 } }),
      color: (0, import_fields.text)({}),
      width: (0, import_fields.float)({}),
      length: (0, import_fields.float)({})
    }
  }),
  Storage: (0, import_core.list)({
    ui: {
      labelField: "name"
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      stockMovements: (0, import_fields.relationship)({
        ref: "StockMovement.storage",
        many: true
      })
    }
  }),
  DocumentType: (0, import_core.list)({
    ui: {
      labelField: "name"
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      stockMovements: (0, import_fields.relationship)({
        ref: "StockMovement.documentType",
        many: true
      })
    }
  }),
  StockMovement: (0, import_core.list)({
    ui: {
      labelField: "movementType"
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      product: (0, import_fields.relationship)({
        ref: "Product.stockMovements",
        many: false
      }),
      storage: (0, import_fields.relationship)({
        ref: "Storage.stockMovements",
        many: false
      }),
      amount: (0, import_fields.float)({ validation: { isRequired: true, min: 0 } }),
      movementType: (0, import_fields.select)({
        type: "string",
        options: ["giri\u015F", "\xE7\u0131k\u0131\u015F"],
        defaultValue: "giri\u015F",
        validation: { isRequired: true }
      }),
      documentType: (0, import_fields.relationship)({
        ref: "DocumentType.stockMovements",
        many: false
      }),
      note: (0, import_fields.text)({}),
      customer: (0, import_fields.relationship)({
        ref: "User.customerMovements",
        many: false
      }),
      date: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        isOrderable: true
      }),
      application: (0, import_fields.relationship)({
        ref: "Application.stockMovements",
        many: false
      }),
      createdAt: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        isOrderable: true,
        access: {
          create: import_access.denyAll,
          update: import_access.denyAll
        }
      })
    }
  }),
  ProductBrand: (0, import_core.list)({
    ui: {
      labelField: "name"
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      products: (0, import_fields.relationship)({ ref: "Product.productBrand", many: true })
    }
  }),
  Car: (0, import_core.list)({
    ui: {
      labelField: "licensePlate"
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isEmployee,
        delete: isAdmin
      }
    },
    fields: {
      vin: (0, import_fields.text)(),
      carModel: (0, import_fields.relationship)({
        ref: "CarModel.cars",
        many: false
      }),
      licensePlate: (0, import_fields.text)({ validation: { isRequired: true } }),
      workOrders: (0, import_fields.relationship)({ ref: "WorkOrder.car", many: true })
    }
  }),
  CarModel: (0, import_core.list)({
    ui: {
      labelField: "name"
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      cars: (0, import_fields.relationship)({ ref: "Car.carModel", many: true }),
      carBrand: (0, import_fields.relationship)({ ref: "CarBrand.carModels", many: false })
    }
  }),
  CarBrand: (0, import_core.list)({
    ui: {
      labelField: "name"
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      carModels: (0, import_fields.relationship)({ ref: "CarModel.carBrand", many: true })
    }
  }),
  ApplicationLocation: (0, import_core.list)({
    ui: {
      labelField: "name"
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      applicationTypes: (0, import_fields.relationship)({
        ref: "ApplicationType.locations",
        many: true
      }),
      applications: (0, import_fields.relationship)({
        ref: "Application.location",
        many: true
      })
    }
  }),
  PaymentPlan: (0, import_core.list)({
    ui: {
      labelField: "name"
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    hooks: {
      afterOperation: async ({ operation, item, context }) => {
        if (operation === "create") {
          for (let i = 1; i < item.periods; i++) {
            await context.query.Notification.createOne({
              data: {
                paymentPlan: { connect: { id: item.id } },
                date: new Date((/* @__PURE__ */ new Date()).getTime() + i * item.periodDuration * 24 * 60 * 60 * 1e3),
                message: "\xD6deme tarihi",
                notifyRoles: ["admin"]
              }
            });
          }
        } else if (operation === "update") {
          const exitingNotifications = context.query.Notification.findMany({
            where: { paymentPlan: { id: { equals: item.id } } },
            query: "id date"
          });
          exitingNotifications.forEach(async (notification) => {
            await context.query.Notification.deleteOne({
              where: { id: notification.id }
            });
          });
          for (let i = 1; i < item.periods; i++) {
            await context.query.Notification.createOne({
              data: {
                paymentPlan: { connect: { id: item.id } },
                date: new Date((/* @__PURE__ */ new Date()).getTime() + i * item.periodDuration * 24 * 60 * 60 * 1e3),
                message: "\xD6deme tarihi",
                notifyRoles: ["admin"]
              }
            });
          }
        }
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      workOrder: (0, import_fields.relationship)({
        ref: "WorkOrder.paymentPlan",
        many: false
      }),
      payments: (0, import_fields.relationship)({
        ref: "Payment.paymentPlan",
        many: true
      }),
      periods: (0, import_fields.float)({ validation: { isRequired: true, min: 1 } }),
      periodDuration: (0, import_fields.float)({ validation: { isRequired: true, min: 1 } }),
      toPay: (0, import_fields.virtual)({
        field: import_core.graphql.field({
          type: import_core.graphql.Float,
          async resolve(item, args, context) {
            try {
              const workOrder = await context.query.WorkOrder.findMany({
                where: { paymentPlan: { id: { equals: item.id } } },
                query: "status applications { price }"
              });
              let total = 0;
              workOrder.forEach((order) => {
                total += order.applications.reduce((acc, app) => acc + app.price, 0);
              });
              let paymentTotal = 0;
              item.payments.forEach((payment) => {
                paymentTotal += payment.amount;
              });
              return total - paymentTotal;
            } catch (e) {
              return 123456;
            }
          }
        })
      }),
      nextPayment: (0, import_fields.virtual)({
        field: import_core.graphql.field({
          type: import_core.graphql.Float,
          async resolve(item, args, context) {
            try {
              const workOrder = await context.query.WorkOrder.findMany({
                where: { paymentPlan: { id: { equals: item.id } } },
                query: "status applications { price }"
              });
              let total = 0;
              workOrder.forEach((order) => {
                total += order.applications.reduce((acc, app) => acc + app.price, 0);
              });
              let paymentTotal = 0;
              item.payments.forEach((payment) => {
                paymentTotal += payment.amount;
              });
              return (total - paymentTotal) / item.periods;
            } catch (e) {
              return 123456;
            }
          }
        })
      }),
      completed: (0, import_fields.virtual)({
        field: import_core.graphql.field({
          type: import_core.graphql.Boolean,
          async resolve(item, args, context) {
            try {
              const payments = await context.query.PaymentPlanPayment.findMany({
                where: { paymentPlan: { id: { equals: item.id } } },
                query: "amount"
              });
              const workOrder = await context.query.WorkOrder.findMany({
                where: { paymentPlan: { id: { equals: item.id } } },
                query: "status applications { price }"
              });
              let total = 0;
              workOrder.forEach((order) => {
                total += order.applications.reduce((acc, app) => acc + app.price, 0);
              });
              let paymentTotal = 0;
              payments.forEach((payment) => {
                paymentTotal += payment.amount;
              });
              return total <= paymentTotal;
            } catch (e) {
              return false;
            }
          }
        })
      }),
      notifications: (0, import_fields.relationship)({
        ref: "Notification.paymentPlan",
        many: true
      })
    }
  }),
  Payment: (0, import_core.list)({
    ui: {
      labelField: "date"
    },
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isManager,
        delete: isManager
      }
    },
    fields: {
      amount: (0, import_fields.float)({ validation: { isRequired: true, min: 0 } }),
      paymentPlan: (0, import_fields.relationship)({
        ref: "PaymentPlan.payments",
        many: false
      }),
      reference: (0, import_fields.text)({}),
      type: (0, import_fields.select)({
        type: "string",
        options: ["nakit", "kredi kart\u0131", "havale", "\xE7ek", "senet", "banka kart\u0131"],
        defaultValue: "nakit",
        validation: { isRequired: true }
      }),
      date: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        isOrderable: true
      })
    }
  }),
  Notification: (0, import_core.list)({
    ui: {
      labelField: "date"
    },
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: isAdmin
      }
    },
    fields: {
      date: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        isOrderable: true
      }),
      message: (0, import_fields.text)({ validation: { isRequired: true } }),
      paymentPlan: (0, import_fields.relationship)({
        ref: "PaymentPlan.notifications",
        many: false
      }),
      workOrder: (0, import_fields.relationship)({
        ref: "WorkOrder.notifications",
        many: false
      }),
      link: (0, import_fields.text)({}),
      handled: (0, import_fields.checkbox)({ defaultValue: false }),
      notifyRoles: (0, import_fields.multiselect)({
        type: "enum",
        options: ["admin", "customer", "employee", "manager"]
      })
    }
  })
};

// keystone.ts
var keystone_default = withAuth(
  (0, import_core2.config)({
    db: {
      provider: "sqlite",
      url: "file:./keystone.db"
    },
    lists,
    session,
    graphql: {
      bodyParser: {
        limit: "10mb"
      }
    }
  })
);
//# sourceMappingURL=config.js.map
