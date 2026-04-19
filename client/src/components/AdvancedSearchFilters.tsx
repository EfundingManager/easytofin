import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, X, Filter } from "lucide-react";

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  isLoading?: boolean;
}

export interface FilterState {
  query?: string;
  kycStatus?: "pending" | "verified" | "rejected";
  accountAgeFrom?: number;
  accountAgeTo?: number;
  productInterest?: string[];
}

const PRODUCTS = ["Protection", "Pensions", "Health Insurance", "General Insurance", "Investments"];
const KYC_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "verified", label: "Verified", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
];

export function AdvancedSearchFilters({ onFiltersChange, isLoading }: AdvancedSearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [tempFilters, setTempFilters] = useState<FilterState>({});

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTempFilters(filters);
    }
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    onFiltersChange(tempFilters);
    setIsExpanded(false);
  };

  const handleResetFilters = () => {
    const emptyFilters: FilterState = {};
    setFilters(emptyFilters);
    setTempFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    setIsExpanded(false);
  };

  const handleProductToggle = (product: string) => {
    const current = tempFilters.productInterest || [];
    const updated = current.includes(product)
      ? current.filter((p) => p !== product)
      : [...current, product];
    setTempFilters({
      ...tempFilters,
      productInterest: updated.length > 0 ? updated : undefined,
    });
  };

  const handleRemoveFilter = (filterKey: keyof FilterState) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
    setTempFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={handleExpandToggle}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Advanced Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </Button>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleRemoveFilter("query")}
            >
              Search: {filters.query}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.kycStatus && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleRemoveFilter("kycStatus")}
            >
              KYC: {filters.kycStatus}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {(filters.accountAgeFrom !== undefined || filters.accountAgeTo !== undefined) && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                handleRemoveFilter("accountAgeFrom");
                handleRemoveFilter("accountAgeTo");
              }}
            >
              Age: {filters.accountAgeFrom || "0"}-{filters.accountAgeTo || "∞"} days
              <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.productInterest && filters.productInterest.length > 0 && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleRemoveFilter("productInterest")}
            >
              Products: {filters.productInterest.length}
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filter Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by Name, Email, or Phone</label>
              <Input
                placeholder="e.g., John Doe, john@example.com, +353..."
                value={tempFilters.query || ""}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    query: e.target.value || undefined,
                  })
                }
              />
            </div>

            {/* KYC Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">KYC Verification Status</label>
              <div className="flex gap-2">
                {KYC_STATUSES.map((status) => (
                  <Button
                    key={status.value}
                    variant={tempFilters.kycStatus === status.value ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setTempFilters({
                        ...tempFilters,
                        kycStatus:
                          tempFilters.kycStatus === status.value
                            ? undefined
                            : (status.value as "pending" | "verified" | "rejected"),
                      })
                    }
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Account Age Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Age (days)</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="From"
                    min="0"
                    value={tempFilters.accountAgeFrom || ""}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        accountAgeFrom: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <span className="text-muted-foreground">to</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="To"
                    min="0"
                    value={tempFilters.accountAgeTo || ""}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        accountAgeTo: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave blank for no limit. Example: 0-30 for accounts created in last 30 days
              </p>
            </div>

            {/* Product Interest Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Interest</label>
              <div className="grid grid-cols-2 gap-2">
                {PRODUCTS.map((product) => (
                  <Button
                    key={product}
                    variant={
                      tempFilters.productInterest?.includes(product) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleProductToggle(product)}
                    className="justify-start"
                  >
                    {product}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleApplyFilters}
                disabled={isLoading}
                className="flex-1"
              >
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                disabled={isLoading}
                className="flex-1"
              >
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
