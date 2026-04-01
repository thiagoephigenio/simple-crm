<?php

namespace App\Models;

use Database\Factories\ImportLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'organization_id', 'integration_setting_id', 'status', 'source_file',
    'records_total', 'records_imported', 'records_failed', 'error_summary',
    'started_at', 'finished_at',
])]
class ImportLog extends Model
{
    /** @use HasFactory<ImportLogFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'error_summary' => 'array',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /** @return BelongsTo<IntegrationSetting, $this> */
    public function integrationSetting(): BelongsTo
    {
        return $this->belongsTo(IntegrationSetting::class);
    }

    public function isFinished(): bool
    {
        return in_array($this->status, ['done', 'failed', 'partial']);
    }
}
