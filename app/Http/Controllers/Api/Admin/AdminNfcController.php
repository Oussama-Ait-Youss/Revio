<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\NfcCard;
use App\Models\NfcRequest;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminNfcController extends Controller
{
    public function manufacture(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $quantity = $request->quantity;
        $cards = [];
        $now = now();

        for ($i = 0; $i < $quantity; $i++) {
            $cards[] = [
                'uid' => Str::uuid()->toString(),
                'public_token' => Str::random(32),
                'restaurant_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        NfcCard::insert($cards);

        return response()->json([
            'message' => "Successfully manufactured $quantity NFC cards.",
            'manufactured' => $quantity
        ]);
    }

    public function requestsQueue()
    {
        $requests = NfcRequest::where('status', 'PENDING')
            ->with('restaurant')
            ->orderBy('created_at', 'asc')
            ->get();

        $metrics = [
            'total_unallocated' => NfcCard::unallocated()->count(),
            'total_distributed' => NfcCard::whereNotNull('restaurant_id')->count(),
        ];

        return response()->json([
            'requests' => $requests,
            'metrics' => $metrics
        ]);
    }

    public function process(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:APPROVED,REJECTED'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $nfcRequest = NfcRequest::findOrFail($id);

        if ($nfcRequest->status !== 'PENDING') {
            return response()->json(['message' => 'Request is already processed.'], 400);
        }

        if ($request->status === 'REJECTED') {
            $nfcRequest->update(['status' => 'REJECTED']);
            return response()->json(['message' => 'Request rejected successfully.']);
        }

        // APPROVED
        $quantity = $nfcRequest->quantity;

        DB::beginTransaction();
        try {
            $unallocatedCount = NfcCard::unallocated()->lockForUpdate()->count();

            if ($unallocatedCount < $quantity) {
                DB::rollBack();
                return response()->json(['message' => 'Not enough unallocated cards in inventory.'], 422);
            }

            // Get exact quantity of cards
            $cards = NfcCard::unallocated()->lockForUpdate()->limit($quantity)->get();
            $cardIds = $cards->pluck('id')->toArray();

            // Update cards
            NfcCard::whereIn('id', $cardIds)->update([
                'restaurant_id' => $nfcRequest->restaurant_id,
            ]);

            // Update request
            $nfcRequest->update(['status' => 'APPROVED']);

            DB::commit();

            return response()->json(['message' => "Successfully approved and allocated $quantity cards."]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Transaction failed: ' . $e->getMessage()], 500);
        }
    }
}
