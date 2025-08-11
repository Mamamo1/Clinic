<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Crypt;

class MedicalHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'is_pwd',
        'pwd_disability',
        'anemia',
        'bleeding_disorders',
        'vertigo_dizziness',
        'migraine',
        'epilepsy',
        'panic_anxiety',
        'hyperacidity_gerd',
        'heart_disease',
        'kidney_disease',
        'asthma',
        'sexually_transmitted_illness',
        'congenital_heart_disease',
        'immunocompromised',
        'immunocompromised_specify',
        'musculoskeletal_injury',
        'musculoskeletal_injury_specify',
        'mumps',
        'chickenpox',
        'hepatitis',
        'scoliosis',
        'diabetes_mellitus',
        'head_injury',
        'visual_defect',
        'visual_defect_specify',
        'hearing_defect',
        'hearing_defect_specify',
        'tuberculosis',
        'hypertension',
        'g6pd',
        'rheumatic_heart_disease',
        'allergies_specify',
    ];

    // Cast boolean fields
    protected $casts = [
        'is_pwd' => 'boolean',
        'anemia' => 'boolean',
        'bleeding_disorders' => 'boolean',
        'vertigo_dizziness' => 'boolean',
        'migraine' => 'boolean',
        'epilepsy' => 'boolean',
        'panic_anxiety' => 'boolean',
        'hyperacidity_gerd' => 'boolean',
        'heart_disease' => 'boolean',
        'kidney_disease' => 'boolean',
        'asthma' => 'boolean',
        'sexually_transmitted_illness' => 'boolean',
        'congenital_heart_disease' => 'boolean',
        'immunocompromised' => 'boolean',
        'musculoskeletal_injury' => 'boolean',
        'mumps' => 'boolean',
        'chickenpox' => 'boolean',
        'hepatitis' => 'boolean',
        'scoliosis' => 'boolean',
        'diabetes_mellitus' => 'boolean',
        'head_injury' => 'boolean',
        'visual_defect' => 'boolean',
        'hearing_defect' => 'boolean',
        'tuberculosis' => 'boolean',
        'hypertension' => 'boolean',
        'g6pd' => 'boolean',
        'rheumatic_heart_disease' => 'boolean',
    ];

    /**
     * Relationship with User model
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get active medical conditions
     */
    public function getActiveConditionsAttribute()
    {
        $conditions = [];
        $medicalFields = [
            'anemia', 'bleeding_disorders', 'vertigo_dizziness', 'migraine',
            'epilepsy', 'panic_anxiety', 'hyperacidity_gerd', 'heart_disease',
            'kidney_disease', 'asthma', 'sexually_transmitted_illness',
            'congenital_heart_disease', 'immunocompromised', 'musculoskeletal_injury',
            'mumps', 'chickenpox', 'hepatitis', 'scoliosis', 'diabetes_mellitus',
            'head_injury', 'visual_defect', 'hearing_defect', 'tuberculosis',
            'hypertension', 'g6pd', 'rheumatic_heart_disease'
        ];

        foreach ($medicalFields as $field) {
            if ($this->$field) {
                $conditions[] = $field;
            }
        }

        return $conditions;
    }

    /**
     * Check if user has critical conditions
     */
    public function hasCriticalConditionsAttribute()
    {
        $criticalConditions = [
            'heart_disease', 'kidney_disease', 'diabetes_mellitus',
            'hypertension', 'congenital_heart_disease', 'immunocompromised'
        ];

        foreach ($criticalConditions as $condition) {
            if ($this->$condition) {
                return true;
            }
        }

        return false;
    }
}
