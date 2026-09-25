/**
 * @file route.ts
 * @route GET, PUT, DELETE /api/admin/use-cases/[id]
 * @access Admin only per docs/04-access-control.md & docs/05-routes.md
 * @description Admin endpoint to view, update, or remove a specific use case application taxonomy item.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import UseCase from '@/models/UseCase';
import { getAuthUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Handles GET requests to retrieve a single use case for editing.
 */
export async function GET(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    const { id } = await ctx.params;
    await connectToDatabase();

    const useCase = await UseCase.findById(id).lean();
    if (!useCase) {
      return NextResponse.json(
        { success: false, message: 'Use case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, useCase });
  } catch (error: unknown) {
    console.error('Error fetching use case:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch use case' },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update a use case.
 */
export async function PUT(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    const { id } = await ctx.params;
    const body = await req.json();

    await connectToDatabase();

    const updatedUseCase = await UseCase.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedUseCase) {
      return NextResponse.json(
        { success: false, message: 'Use case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Use case updated successfully',
      useCase: updatedUseCase,
    });
  } catch (error: unknown) {
    console.error('Error updating use case:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update use case' },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to remove a use case.
 */
export async function DELETE(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    const { id } = await ctx.params;
    await connectToDatabase();

    const deleted = await UseCase.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Use case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Use case deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting use case:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete use case' },
      { status: 500 }
    );
  }
}
