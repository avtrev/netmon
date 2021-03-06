import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'searchFilter'
})
export class FilterPipe implements PipeTransform {

    transform(items: any[], searchText: string): any[] {
        if (!items) {
            return [];
        }
        if (!searchText) {
            return items;
        }
        searchText = searchText.toLocaleLowerCase();
        // console.log(items)
        return items.filter((it: any) => {
            for (let i in Object.keys(it)) {
                let cellData = it[Object.keys(it)[i]]
                //if array
                if (cellData instanceof Array) {
                    // console.log("cell contains array")
                    for (let j of cellData) {
                        if (j.toLocaleLowerCase().includes(searchText)) {
                            return it;
                        }
                    }
                } else if (cellData.toLocaleLowerCase().includes(searchText)) {
                    // console.log(it[Object.keys(it)[i]])
                    return it;
                }
            }
            // return it[Object.keys(it)[0]].toLocaleLowerCase().includes(searchText);
            //return it.toLocaleLowerCase().includes(searchText);
        });
    }

}
