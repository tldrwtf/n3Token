import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
export default function DataTable(_a) {
    var data = _a.data, columns = _a.columns, _b = _a.searchPlaceholder, searchPlaceholder = _b === void 0 ? "Search..." : _b, _c = _a.filterOptions, filterOptions = _c === void 0 ? [] : _c, onRowAction = _a.onRowAction, _d = _a.actions, actions = _d === void 0 ? [] : _d, _e = _a.pageSize, pageSize = _e === void 0 ? 10 : _e;
    var _f = useState(""), searchTerm = _f[0], setSearchTerm = _f[1];
    var _g = useState("all"), statusFilter = _g[0], setStatusFilter = _g[1];
    var _h = useState(1), currentPage = _h[0], setCurrentPage = _h[1];
    var _j = useState(new Set()), selectedRows = _j[0], setSelectedRows = _j[1];
    var filteredData = data.filter(function (row) {
        var matchesSearch = Object.values(row).some(function (value) {
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
        var matchesFilter = statusFilter === "all" || row.status === statusFilter;
        return matchesSearch && matchesFilter;
    });
    var totalPages = Math.ceil(filteredData.length / pageSize);
    var startIndex = (currentPage - 1) * pageSize;
    var paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
    var handleSelectAll = function (checked) {
        if (checked) {
            setSelectedRows(new Set(paginatedData.map(function (row) { return row.id; })));
        }
        else {
            setSelectedRows(new Set());
        }
    };
    var handleSelectRow = function (id, checked) {
        var newSelected = new Set(selectedRows);
        if (checked) {
            newSelected.add(id);
        }
        else {
            newSelected.delete(id);
        }
        setSelectedRows(newSelected);
    };
    var getStatusBadge = function (status) {
        var variants = {
            valid: "bg-green-100 text-green-800",
            invalid: "bg-red-100 text-red-800",
            expired: "bg-yellow-100 text-yellow-800",
            checking: "bg-blue-100 text-blue-800",
            unchecked: "bg-gray-100 text-gray-800",
        };
        return variants[status] || variants.unchecked;
    };
    return (<div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Data Table</h3>
          <div className="flex items-center space-x-3">
            <Input placeholder={searchPlaceholder} value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="w-64"/>
            {filterOptions.length > 0 && (<Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {filterOptions.map(function (option) { return (<SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>); })}
                </SelectContent>
              </Select>)}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox checked={selectedRows.size === paginatedData.length && paginatedData.length > 0} onCheckedChange={handleSelectAll}/>
              </TableHead>
              {columns.map(function (column) { return (<TableHead key={column.key}>{column.label}</TableHead>); })}
              {actions.length > 0 && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(function (row) { return (<TableRow key={row.id} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox checked={selectedRows.has(row.id)} onCheckedChange={function (checked) { return handleSelectRow(row.id, checked); }}/>
                </TableCell>
                {columns.map(function (column) { return (<TableCell key={column.key}>
                    {column.render ? column.render(row[column.key], row) :
                    column.key === 'status' ? (<Badge className={getStatusBadge(row[column.key])}>
                         {row[column.key]}
                       </Badge>) : row[column.key]}
                  </TableCell>); })}
                {actions.length > 0 && (<TableCell>
                    <div className="flex space-x-2">
                      {actions.map(function (action) { return (<Button key={action.action} variant={action.variant || "ghost"} size="sm" onClick={function () { return onRowAction === null || onRowAction === void 0 ? void 0 : onRowAction(action.action, row); }}>
                          {action.label}
                        </Button>); })}
                    </div>
                  </TableCell>)}
              </TableRow>); })}
          </TableBody>
        </Table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} results
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={function () { return setCurrentPage(function (prev) { return Math.max(1, prev - 1); }); }} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4"/>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={function () { return setCurrentPage(function (prev) { return Math.min(totalPages, prev + 1); }); }} disabled={currentPage === totalPages}>
              Next
              <ChevronRight className="h-4 w-4"/>
            </Button>
          </div>
        </div>
      </div>
    </div>);
}
