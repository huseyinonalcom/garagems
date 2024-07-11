import { list } from "@keystone-6/core";
import type { Lists } from ".keystone/types";
import { allowAll, denyAll } from "@keystone-6/core/access";
import { text, relationship, password, timestamp, select, float, multiselect } from "@keystone-6/core/fields";
import { AuthSession } from "@keystone-6/auth";
import { KeystoneContext, SessionStrategy } from "@keystone-6/core/types";

export type Session = {
  itemId: string;
  data: {
    username: string;
    role: string;
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

export const lists: Lists = {
  User: list({
    access: {
      operation: {
        create: isAdmin,
        query: allowAll,
        update: isAdmin,
        delete: denyAll,
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
      }),
      permissions: multiselect({
        type: "enum",
        options: [
          { label: "Warranty", value: "warranty" },
          { label: "Price", value: "price" },
        ],
      }),
      ssid: text({ validation: { isRequired: false } }),
      password: password({ validation: { isRequired: true } }),
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
  WorkOrder: list({
    access: allowAll,
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
      status: select({
        type: "string",
        options: ["active", "inactive", "finished", "canceled", "offer"],
        defaultValue: "inactive",
        validation: { isRequired: true },
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
    access: allowAll,
    fields: {
      workOrder: relationship({
        ref: "WorkOrder.applications",
        many: false,
      }),
      startedAt: timestamp(),
      finishedAt: timestamp(),
      name: text({ validation: { isRequired: true } }),
      description: text({}),
      price: float({ validation: { isRequired: true, min: 0 } }),
      amount: float({ validation: { isRequired: false, min: 0 } }),
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
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      applications: relationship({
        ref: "Application.type",
        many: true,
      }),
    },
  }),
  Product: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      description: text({}),
      price: float({ validation: { isRequired: true, min: 0 } }),
      stock: float({ validation: { isRequired: true, min: 0 } }),
      status: select({
        type: "string",
        options: ["active", "inactive", "discontinued"],
        defaultValue: "active",
        validation: { isRequired: true },
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
      warrantyTime: float({ validation: { isRequired: false, min: 0 } }),
    },
  }),
  ProductBrand: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      products: relationship({ ref: "Product.productBrand", many: true }),
    },
  }),
  Car: list({
    access: allowAll,
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
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      cars: relationship({ ref: "Car.carModel", many: true }),
      carBrand: relationship({ ref: "CarBrand.carModels", many: false }),
    },
  }),
  CarBrand: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      carModels: relationship({ ref: "CarModel.carBrand", many: true }),
    },
  }),
};
