// src/components/ui/PaginationBar.tsx
import { Pagination } from "flowbite-react";
export default function PaginationBar({page=1, total=10}:{page?:number; total?:number;}){
  return (
    <div className="flex justify-center py-8">
      <Pagination currentPage={page} totalPages={total} onPageChange={(p)=> {
        const u=new URL(location.href); u.searchParams.set("page", String(p)); location.href=u.toString();
      }}/>
    </div>
  );
}
