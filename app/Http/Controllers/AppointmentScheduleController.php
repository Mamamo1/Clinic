<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class AppointmentScheduleController extends Controller
{
    private $scheduleFile = 'appointment_schedule.json';
    private $cacheKey = 'appointment_schedule_settings';

    /**
     * Get current appointment schedule settings
     */
    public function index()
    {
        try {
            $settings = $this->getScheduleSettings();
            
            return response()->json([
                'success' => true,
                'data' => $settings,
                'message' => 'Schedule settings retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve schedule settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update appointment schedule settings
     */
    public function store(Request $request)
    {
        // Debug: Log the incoming request data
        \Log::info('Appointment Schedule Request Data:', $request->all());

        $validator = Validator::make($request->all(), [
            'appointments_enabled' => 'required|boolean',
            'doctor_enabled' => 'required|boolean',
            'dentist_enabled' => 'required|boolean',
            'enabled_courses' => 'array',
            'enabled_courses.*' => 'string|in:ABM,STEM,HUMSS',
            'enabled_departments' => 'array',
            'enabled_departments.*' => 'string|in:BSA,BSBA-FINMGT,BSBA-MKTGMGT,BSTM,BSARCH,BSCE,BSCS,BSIT-MWA,BSMT,BSN,BSPSY',
            'employee_enabled' => 'required|boolean',
            'custom_message' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $settings = [
                'appointments_enabled' => (bool) $request->appointments_enabled,
                'doctor_enabled' => (bool) $request->doctor_enabled,
                'dentist_enabled' => (bool) $request->dentist_enabled,
                'employee_enabled' => (bool) $request->employee_enabled,
                'enabled_courses' => $request->enabled_courses ?? [],
                'enabled_departments' => $request->enabled_departments ?? [],
                'custom_message' => $request->custom_message ?? 'Appointments are currently unavailable for your course/department.',
                'updated_at' => now()->toISOString(),
                'updated_by' => auth()->user()->id ?? null
            ];

            // Save to file
            Storage::put($this->scheduleFile, json_encode($settings, JSON_PRETTY_PRINT));
            
            // Update cache
            Cache::put($this->cacheKey, $settings, now()->addHours(24));

            return response()->json([
                'success' => true,
                'data' => $settings,
                'message' => 'Schedule settings updated successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to save schedule settings:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update schedule settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if appointments are available for a specific course/department or employee
     */
    public function checkAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course' => 'nullable|string',
            'account_type' => 'required|string|in:Student,Employee',
            'service_type' => 'required|string|in:doctor,dentist'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $settings = $this->getScheduleSettings();
            $course = $request->course;
            $accountType = $request->account_type;
            $serviceType = $request->service_type;

            // Check if appointments are globally enabled
            if (!$settings['appointments_enabled']) {
                return response()->json([
                    'success' => true,
                    'available' => false,
                    'message' => 'Appointments are currently disabled system-wide.'
                ]);
            }

            // Check if the specific service is enabled
            $serviceEnabled = $serviceType === 'doctor' ? $settings['doctor_enabled'] : $settings['dentist_enabled'];
            if (!$serviceEnabled) {
                return response()->json([
                    'success' => true,
                    'available' => false,
                    'message' => ucfirst($serviceType) . ' appointments are currently disabled.'
                ]);
            }

            if ($accountType === 'Employee') {
                $isAvailable = $settings['employee_enabled'] ?? false;
                return response()->json([
                    'success' => true,
                    'available' => $isAvailable,
                    'message' => $isAvailable ? 'Appointments are available for employees.' : 'Employee appointments are currently disabled.'
                ]);
            }

            // Handle Student account type (existing logic)
            if ($accountType === 'Student' && $course) {
                // Check if course is in enabled courses (SHS) or enabled departments (College)
                $shsCourses = ['ABM', 'STEM', 'HUMSS'];
                $collegeDepartments = ['BSA', 'BSBA-FINMGT', 'BSBA-MKTGMGT', 'BSTM', 'BSARCH', 'BSCE', 'BSCS', 'BSIT-MWA', 'BSMT', 'BSN', 'BSPSY'];

                $isAvailable = false;

                if (in_array($course, $shsCourses)) {
                    // SHS course - check if any SHS courses are enabled
                    $isAvailable = in_array($course, $settings['enabled_courses']);
                } elseif (in_array($course, $collegeDepartments)) {
                    // College department - check if any college departments are enabled
                    $isAvailable = in_array($course, $settings['enabled_departments']);
                }

                return response()->json([
                    'success' => true,
                    'available' => $isAvailable,
                    'message' => $isAvailable ? 'Appointments are available for your course.' : $settings['custom_message']
                ]);
            }

            // Default case
            return response()->json([
                'success' => true,
                'available' => false,
                'message' => 'Invalid account type or missing course information.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check availability: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get schedule settings from cache or file
     */
    private function getScheduleSettings()
    {
        // Try to get from cache first
        $settings = Cache::get($this->cacheKey);
        
        if (!$settings) {
            // Get from file
            if (Storage::exists($this->scheduleFile)) {
                $settings = json_decode(Storage::get($this->scheduleFile), true);
            } else {
                // Default settings
                $settings = [
                    'appointments_enabled' => true,
                    'doctor_enabled' => true,
                    'dentist_enabled' => true,
                    'employee_enabled' => true,
                    'enabled_courses' => ['ABM', 'STEM', 'HUMSS'],
                    'enabled_departments' => ['BSA', 'BSBA-FINMGT', 'BSBA-MKTGMGT', 'BSTM', 'BSARCH', 'BSCE', 'BSCS', 'BSIT-MWA', 'BSMT', 'BSN', 'BSPSY'],
                    'custom_message' => 'Appointments are currently unavailable for your course/department. Please contact the clinic for more information.',
                    'created_at' => now()->toISOString()
                ];
                
                // Save default settings
                Storage::put($this->scheduleFile, json_encode($settings, JSON_PRETTY_PRINT));
            }
            
            // Cache the settings
            Cache::put($this->cacheKey, $settings, now()->addHours(24));
        }

        // Ensure arrays are always present (backward compatibility)
        $settings['enabled_courses'] = $settings['enabled_courses'] ?? [];
        $settings['enabled_departments'] = $settings['enabled_departments'] ?? [];
        $settings['employee_enabled'] = $settings['employee_enabled'] ?? true;

        return $settings;
    }

    /**
     * Clear schedule settings cache
     */
    public function clearCache()
    {
        try {
            Cache::forget($this->cacheKey);
            
            return response()->json([
                'success' => true,
                'message' => 'Schedule settings cache cleared successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache: ' . $e->getMessage()
            ], 500);
        }
    }
}
