<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class DentalHistory extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'previous_dentist',
        'last_dental_visit',
        'last_tooth_extraction',
        'allergy_anesthesia',
        'allergy_pain_reliever',
        'last_dental_procedure',
        'additional_notes'
    ];

    protected $casts = [
        'last_dental_visit' => 'date:Y-m-d',
        'allergy_anesthesia' => 'boolean',
        'allergy_pain_reliever' => 'boolean'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessors
    public function getLastDentalVisitFormattedAttribute()
    {
        return $this->last_dental_visit ? $this->last_dental_visit->format('M d, Y') : null;
    }

    // Scopes
    public function scopeWithAllergies($query)
    {
        return $query->where('allergy_anesthesia', true)
                    ->orWhere('allergy_pain_reliever', true);
    }

    public function scopeRecentVisits($query, $months = 6)
    {
        return $query->where('last_dental_visit', '>=', Carbon::now()->subMonths($months));
    }
}
