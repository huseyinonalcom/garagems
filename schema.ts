// This file is where we define the lists, fields and hooks for our data.
// If you want to learn more about how lists are configured, please read
// - https://keystonejs.com/docs/config/lists

import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";

// see https://keystonejs.com/docs/fields/overview for the full list of fields
//   this is a few common fields for an example
import { text, relationship, password, timestamp, select, float } from "@keystone-6/core/fields";

// when using Typescript, you can refine your types to a stricter subset by importing
// the generated types from '.keystone/types'
import type { Lists } from ".keystone/types";

export const lists: Lists = {
  User: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,
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
      cars: relationship({ ref: "Car.owner", many: true }),
      ssid: text({ validation: { isRequired: false } }),
      password: password({ validation: { isRequired: true } }),
      workOrders: relationship({ ref: "WorkOrder.creator", many: true }),
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
      }),
      startedAt: timestamp(),
      finishedAt: timestamp(),
      car: relationship({
        ref: "Car.workOrders",
        many: false,
      }),
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
      amount: float({ validation: { isRequired: true, min: 0 } }),
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
    },
  }),
  Product: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      description: text({}),
      price: float({ validation: { isRequired: true, min: 0 } }),
      inStock: float({ validation: { isRequired: true, min: 0 } }),
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
      owner: relationship({
        ref: "User.cars",
        many: false,
      }),
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
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      cars: relationship({ ref: "Car.carModel", many: true }),
      carBrand: relationship({ ref: "CarBrand.carModels", many: false }),
    },
  }),
  CarBrand: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      carModels: relationship({ ref: "CarModel.carBrand", many: true }),
    },
  }),
};
