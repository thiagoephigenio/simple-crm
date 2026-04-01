<?php

namespace App\Models;

use Database\Factories\IntegrationSettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['organization_id', 'name', 'entity_type', 'source_type', 'config', 'schedule', 'is_active'])]
class IntegrationSetting extends Model
{
    /** @use HasFactory<IntegrationSettingFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'config' => 'encrypted:array',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /** @return HasMany<ImportLog, $this> */
    public function importLogs(): HasMany
    {
        return $this->hasMany(ImportLog::class);
    }
}
