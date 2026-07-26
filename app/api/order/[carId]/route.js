import mongoose from "mongoose";
import { Order } from "@models/order";
import { Apartment } from "@models/apartment";
import { connectToDB } from "@lib/database";
import { withOrderVisibility } from "@/middleware/withOrderVisibility";
import { buildOrdersForApartmentFilter } from "@/domain/orders/apartmentOrderLookup";

async function handler(request, { params }) {
  try {
    await connectToDB();
    const { carId } = params;

    let filter = { car: carId };
    if (carId && mongoose.Types.ObjectId.isValid(carId)) {
      const apartment = await Apartment.findById(carId).lean();
      if (apartment) {
        filter = buildOrdersForApartmentFilter(apartment);
      }
    }

    const orders = await Order.find(filter).lean();

    if (orders.length === 0) {
      return new Response("No Orders for this car", { status: 200 });
    }

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to fetch orders", { status: 500 });
  }
}

export const GET = withOrderVisibility(handler);
