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
var import_core2 = require("@keystone-6/core");

// schema.ts
var import_core = require("@keystone-6/core");
var import_access = require("@keystone-6/core/access");
var import_fields = require("@keystone-6/core/fields");
function isAdmin({ session: session2 }) {
  if (!session2)
    return false;
  if (session2.data.role == "admin")
    return true;
  return false;
}
function isEmployee({ session: session2 }) {
  if (!session2)
    return false;
  if (session2.data.role == "employee" || session2.data.role == "admin" || session2.data.role == "manager")
    return true;
  return false;
}
var lists = {
  User: (0, import_core.list)({
    access: {
      operation: {
        create: isAdmin,
        query: import_access.allowAll,
        update: isAdmin,
        delete: import_access.denyAll
      }
    },
    fields: {
      username: (0, import_fields.text)({ validation: { isRequired: true }, isIndexed: "unique" }),
      email: (0, import_fields.text)({
        isIndexed: "unique"
      }),
      phone: (0, import_fields.text)({ validation: { isRequired: false } }),
      firstname: (0, import_fields.text)({ validation: { isRequired: true } }),
      lastname: (0, import_fields.text)({ validation: { isRequired: false } }),
      role: (0, import_fields.select)({
        type: "string",
        options: ["admin", "customer", "employee", "manager"],
        defaultValue: "customer",
        validation: { isRequired: true },
        isIndexed: true
      }),
      permissions: (0, import_fields.multiselect)({
        type: "enum",
        options: [
          { label: "Warranty", value: "warranty" },
          { label: "Price", value: "price" }
        ]
      }),
      ssid: (0, import_fields.text)({ validation: { isRequired: false } }),
      password: (0, import_fields.password)({ validation: { isRequired: true } }),
      workOrders: (0, import_fields.relationship)({ ref: "WorkOrder.creator", many: true }),
      clientOrders: (0, import_fields.relationship)({ ref: "WorkOrder.customer", many: true }),
      applicationsToApply: (0, import_fields.relationship)({
        ref: "Application.applicant",
        many: true
      }),
      applications: (0, import_fields.relationship)({
        ref: "Application.creator",
        many: true
      })
    }
  }),
  WorkOrder: (0, import_core.list)({
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isEmployee,
        delete: import_access.denyAll
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
      status: (0, import_fields.select)({
        type: "string",
        options: ["active", "inactive", "finished", "canceled", "offer"],
        defaultValue: "inactive",
        validation: { isRequired: true }
      }),
      startedAt: (0, import_fields.timestamp)(),
      finishedAt: (0, import_fields.timestamp)(),
      car: (0, import_fields.relationship)({
        ref: "Car.workOrders",
        many: false
      }),
      customer: (0, import_fields.relationship)({
        ref: "User.clientOrders",
        many: false
      }),
      notes: (0, import_fields.text)({}),
      reduction: (0, import_fields.float)({ validation: { isRequired: false, min: 0 } }),
      applications: (0, import_fields.relationship)({
        ref: "Application.workOrder",
        many: true
      })
    }
  }),
  Application: (0, import_core.list)({
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isEmployee,
        delete: import_access.denyAll
      }
    },
    fields: {
      workOrder: (0, import_fields.relationship)({
        ref: "WorkOrder.applications",
        many: false
      }),
      startedAt: (0, import_fields.timestamp)(),
      finishedAt: (0, import_fields.timestamp)(),
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      description: (0, import_fields.text)({}),
      price: (0, import_fields.float)({ validation: { isRequired: true, min: 0 } }),
      amount: (0, import_fields.float)({ validation: { isRequired: false, min: 0 } }),
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
      })
    }
  }),
  ApplicationType: (0, import_core.list)({
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: import_access.denyAll
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      applications: (0, import_fields.relationship)({
        ref: "Application.type",
        many: true
      })
    }
  }),
  Product: (0, import_core.list)({
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: import_access.denyAll
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      description: (0, import_fields.text)({}),
      price: (0, import_fields.float)({ validation: { isRequired: true, min: 0 } }),
      stock: (0, import_fields.float)({ validation: { isRequired: true, min: 0 } }),
      status: (0, import_fields.select)({
        type: "string",
        options: ["active", "inactive", "discontinued"],
        defaultValue: "active",
        validation: { isRequired: true }
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
      warrantyTime: (0, import_fields.float)({ validation: { isRequired: false, min: 0 } })
    }
  }),
  ProductBrand: (0, import_core.list)({
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: import_access.denyAll
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      products: (0, import_fields.relationship)({ ref: "Product.productBrand", many: true })
    }
  }),
  Car: (0, import_core.list)({
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isEmployee,
        delete: import_access.denyAll
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
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: import_access.denyAll
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      cars: (0, import_fields.relationship)({ ref: "Car.carModel", many: true }),
      carBrand: (0, import_fields.relationship)({ ref: "CarBrand.carModels", many: false })
    }
  }),
  CarBrand: (0, import_core.list)({
    access: {
      operation: {
        create: isAdmin,
        query: isEmployee,
        update: isAdmin,
        delete: import_access.denyAll
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      carModels: (0, import_fields.relationship)({ ref: "CarModel.carBrand", many: true })
    }
  })
};

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
  sessionData: "username role permissions",
  secretField: "password",
  // WARNING: remove initFirstItem functionality in production
  //   see https://keystonejs.com/docs/config/auth#init-first-item for more
  initFirstItem: {
    // if there are no items in the database, by configuring this field
    //   you are asking the Keystone AdminUI to create a new user
    //   providing inputs for these fields
    fields: ["username", "firstname", "role", "email", "password"]
    // it uses context.sudo() to do this, which bypasses any access control you might have
    //   you shouldn't use this in production
  }
});
var sessionMaxAge = 60 * 60 * 24 * 30;
var session = (0, import_session.statelessSessions)({
  maxAge: sessionMaxAge,
  secret: sessionSecret
});

// keystone.ts
var keystone_default = withAuth(
  (0, import_core2.config)({
    db: {
      // we're using sqlite for the fastest startup experience
      //   for more information on what database might be appropriate for you
      //   see https://keystonejs.com/docs/guides/choosing-a-database#title
      provider: "sqlite",
      url: "file:./keystone.db"
    },
    lists,
    session
  })
);
//# sourceMappingURL=config.js.map
