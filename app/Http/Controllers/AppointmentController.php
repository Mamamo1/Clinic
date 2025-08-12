<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    /**
     * Get available time slots for a specific date
     */
    public function getAvailableSlots(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'date' => 'required|date|after_or_equal:today',
                'service_type' => 'sometimes|in:doctor,dentist',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $date = $request->get('date');
            $serviceType = $request->get('service_type');

            // Define available time slots (8:00 AM - 5:00 PM, 30-minute intervals)
            $allSlots = [
                '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
                '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
                '15:00', '15:30', '16:00', '16:30'
            ];

            // Get booked slots for the date
            $bookedSlotsQuery = Appointment::where('appointment_date', $date)
                ->whereIn('status', ['pending', 'confirmed']);

            if ($serviceType) {
                $bookedSlotsQuery->where('service_type', $serviceType);
            }

            $bookedSlots = $bookedSlotsQuery->pluck('appointment_time')
                ->map(function ($time) {
                    return date('H:i', strtotime($time));
                })->toArray();

            // Calculate available slots
            $availableSlots = array_diff($allSlots, $bookedSlots);

            return response()->json([
                'success' => true,
                'data' => [
                    'date' => $date,
                    'available_slots' => array_values($availableSlots),
                    'booked_slots' => $bookedSlots,
                    'total_slots' => count($allSlots),
                    'available_count' => count($availableSlots),
                    'booked_count' => count($bookedSlots)
                ],
                'message' => 'Available slots retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving available slots: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current user's appointments
     */
    public function getMyAppointments(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $appointments = Appointment::where('user_id', $user->id)
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $appointments,
                'message' => 'Appointments retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving appointments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created appointment
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'student_id' => 'required|string|max:255',
                'full_name' => 'required|string|max:255',
                'service_type' => 'required|in:doctor,dentist',
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required|date_format:H:i',
                'reason' => 'required|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if the appointment slot is available
            $existingAppointment = Appointment::where('appointment_date', $request->appointment_date)
                ->where('appointment_time', $request->appointment_time)
                ->where('service_type', $request->service_type)
                ->whereIn('status', ['pending', 'confirmed'])
                ->first();

            if ($existingAppointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected time slot is not available'
                ], 409);
            }

            // Check if appointment date is not in the past
            $appointmentDateTime = Carbon::parse($request->appointment_date . ' ' . $request->appointment_time);
            if ($appointmentDateTime->isPast()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot book appointments in the past'
                ], 422);
            }

            // Check if appointment is within business hours (8:00 AM - 5:00 PM)
            $appointmentTime = Carbon::parse($request->appointment_time);
            $startTime = Carbon::parse('08:00');
            $endTime = Carbon::parse('17:00');

            if ($appointmentTime->lt($startTime) || $appointmentTime->gt($endTime)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointments can only be booked between 8:00 AM and 5:00 PM'
                ], 422);
            }

            // Check if user already has an appointment on the same date
            $existingUserAppointment = Appointment::where('user_id', $request->user_id)
                ->where('appointment_date', $request->appointment_date)
                ->whereIn('status', ['pending', 'confirmed'])
                ->first();

            if ($existingUserAppointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have an appointment scheduled for this date'
                ], 409);
            }

            $appointment = Appointment::create([
                'user_id' => $request->user_id,
                'student_id' => $request->student_id,
                'full_name' => $request->full_name,
                'service_type' => $request->service_type,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'reason' => $request->reason,
                'status' => 'pending'
            ]);

            return response()->json([
                'success' => true,
                'data' => $appointment,
                'message' => 'Appointment booked successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel an appointment
     */
    public function cancel($id): JsonResponse
    {
        try {
            $user = Auth::user();
            $appointment = Appointment::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // Check if appointment can be cancelled
            if ($appointment->status === 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot cancel a completed appointment'
                ], 422);
            }

            if ($appointment->status === 'cancelled') {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointment is already cancelled'
                ], 422);
            }

            // Check if appointment is at least 24 hours away
            $appointmentDateTime = Carbon::parse($appointment->appointment_date . ' ' . $appointment->appointment_time);
            if ($appointmentDateTime->diffInHours(Carbon::now()) < 24) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointments can only be cancelled at least 24 hours in advance'
                ], 422);
            }

            $appointment->update(['status' => 'cancelled']);

            return response()->json([
                'success' => true,
                'data' => $appointment,
                'message' => 'Appointment cancelled successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error cancelling appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all appointments (admin only)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Appointment::with('user');

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('service_type')) {
                $query->where('service_type', $request->service_type);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('student_id', 'like', "%{$search}%")
                      ->orWhere('reason', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'appointment_date');
            $sortOrder = $request->get('sort_order', 'desc');
            
            if ($sortBy === 'date') {
                $query->orderBy('appointment_date', $sortOrder)
                      ->orderBy('appointment_time', $sortOrder);
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }

            $appointments = $query->get();

            return response()->json([
                'success' => true,
                'data' => $appointments,
                'message' => 'Appointments retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving appointments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update appointment status (admin only)
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,confirmed,completed,cancelled',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $appointment = Appointment::findOrFail($id);
            $appointment->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'data' => $appointment,
                'message' => 'Appointment status updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating appointment: ' . $e->getMessage()
            ], 500);
        }
    }
}
