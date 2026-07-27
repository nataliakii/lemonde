import Company from "@models/company";
import { connectToDB } from "@lib/database";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * PUT /api/company/buffer/[id]
 * Updates only bufferTime (partial $set — does not re-validate unrelated fields).
 */
export const PUT = async (request, { params }) => {
  try {
    await connectToDB();

    const { id: companyId } = params;

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { bufferTime } = body;

    if (bufferTime === undefined || bufferTime === null) {
      return NextResponse.json(
        { error: "bufferTime is required" },
        { status: 400 }
      );
    }

    const bufferTimeNumber = Number(bufferTime);
    if (
      isNaN(bufferTimeNumber) ||
      bufferTimeNumber < 0 ||
      bufferTimeNumber > 24
    ) {
      return NextResponse.json(
        { error: "bufferTime must be a number between 0 and 24 hours" },
        { status: 400 }
      );
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { $set: { bufferTime: bufferTimeNumber } },
      { new: true, runValidators: false }
    );

    if (!updatedCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    revalidatePath(`/api/company/${companyId}`);

    return NextResponse.json(
      {
        success: true,
        message: "Buffer time updated successfully",
        data: updatedCompany,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating company bufferTime:", error);
    return NextResponse.json(
      { error: `Failed to update bufferTime: ${error.message}` },
      { status: 500 }
    );
  }
};
