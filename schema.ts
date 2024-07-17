import {
  text,
  relationship,
  password,
  timestamp,
  select,
  float,
  multiselect,
  image,
} from "@keystone-6/core/fields";
import { denyAll } from "@keystone-6/core/access";
import type { Lists } from ".keystone/types";
import { list } from "@keystone-6/core";

export type Session = {
  itemId: string;
  data: {
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

  return false;
}
function isManager({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can do anything
  if (session.data.role == "admin" || session.data.role == "manager")
    return true;

  return false;
}

function isEmployee({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can do anything
  if (
    session.data.role == "employee" ||
    session.data.role == "admin" ||
    session.data.role == "manager"
  )
    return true;

  return false;
}

function isUser({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can do anything
  if (
    session.data.role == "employee" ||
    session.data.role == "admin" ||
    session.data.role == "manager" ||
    session.data.role == "customer"
  )
    return true;

  return false;
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
      status: select({
        type: "string",
        options: ["aktif", "inaktif", "tamamlandı", "iptal", "teklif"],
        defaultValue: "inaktif",
        validation: { isRequired: true },
        access: {
          update: isManager,
        },
      }),
      startedAt: timestamp(),
      finishedAt: timestamp(),
      car: relationship({
        ref: "Car.workOrders",
        many: false,
      }),
      customer: relationship({
        ref: "User.clientOrders",
        many: false,
      }),
      notes: text({}),
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
    access: {
      operation: {
        create: isEmployee,
        query: isEmployee,
        update: isEmployee,
        delete: isManager,
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
      amount: float({ validation: { isRequired: false, min: 0 } }),
      locations: relationship({
        ref: "ApplicationLocation.applications",
        many: true,
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
      stock: float({ validation: { isRequired: true, min: 0 } }),
      status: select({
        type: "string",
        options: ["aktif", "inaktif", "iptal"],
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
      warrantyTime: float({ validation: { isRequired: false, min: 0 } }),
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
        ref: "Application.locations",
        many: true,
      }),
    },
  }),
};
