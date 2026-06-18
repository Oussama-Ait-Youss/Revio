<?php

namespace App\Models\Concerns;

use App\Models\Role;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToRestaurantTenant
{
    protected static function bootBelongsToRestaurantTenant(): void
    {
        static::addGlobalScope('manager_restaurant', function (Builder $builder): void {
            $user = auth('sanctum')->user();

            if (
                $user?->restaurant_id
                && $user->role?->name === Role::MANAGER
            ) {
                $builder->where(
                    $builder->getModel()->qualifyColumn('restaurant_id'),
                    $user->restaurant_id
                );
            }
        });
    }
}
