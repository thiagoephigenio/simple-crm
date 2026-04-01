<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('import_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('integration_setting_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'processing', 'done', 'failed', 'partial'])->default('pending');
            $table->string('source_file')->nullable();
            $table->integer('records_total')->default(0);
            $table->integer('records_imported')->default(0);
            $table->integer('records_failed')->default(0);
            $table->json('error_summary')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_logs');
    }
};
