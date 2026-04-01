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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('external_reference');
            $table->date('period');
            $table->decimal('amount', 15, 2);
            $table->integer('quantity')->default(0);
            $table->string('product_line')->nullable();
            $table->timestamp('imported_at')->nullable();

            $table->unique(['organization_id', 'external_reference']);
            $table->index(['organization_id', 'period']);
            $table->index(['organization_id', 'customer_id']);
            $table->index(['organization_id', 'store_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
