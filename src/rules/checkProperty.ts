import {
    EmphasizeElements,
    IModelApp,
    NotifyMessageDetails,
    OutputMessagePriority,
    StandardViewId,
  } from "@itwin/core-frontend";

  import { UiFramework } from "@itwin/appui-react";
import { BentleyAPIFunctions } from "../helper/BentleyAPIFunctions";
import { emphasizeResults } from "../common/common";

function myfind(a : any, value: any) : any
{
    try {
        for (const item of a) {
            if (item.code.toUpperCase() === value.toUpperCase())
            {
                return  item

            }
        }
    }
    catch(e) {
        const _e = e  as Error;
        console.log ("Error in myfind" + _e.message)
    }
    return undefined
}

export async function checkProperty () : Promise<void>{
/* 
 load the BS1192.json rules
 and validate against them
*/
    IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, " starting Property checks ..."));
    const rules = require("./checkProperty.json");
    const invalidElements:any = [];
    const vp = IModelApp.viewManager.getFirstOpenView();
    if (!vp) {
        return
    }
    for (const ruleset of Object.keys(rules.rules))
    {
        const aRule = rules.rules[ruleset];
        IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, " rule " + aRule.id));


        const aQuery = "select distinct ec_classname(class.id, 's.c') as ecclass, pd.name from meta.ecpropertydef pd join bis.geometricelement3d ge on ge.ecclassid = pd.class.id where  (pd.DisplayLabel like '%" + aRule.property + "%' OR pd.Name like '%" + aRule.property + "%')"

        const aResults = await BentleyAPIFunctions._executeQuery(vp.iModel, aQuery);
        for await (const aResult of aResults) {
            // now we have a list of classes that are have a property with the required property name
            // now let's find the instances
            switch (aRule.ruletype) {
                case "propertylist" : {
                    const aInstanceQuery = "select ecinstanceid as id, " + aResult[1] + " as propertyname from " + aResult[0] + "as el join bis.geometricelement3d as gw on gw.ecinstanceid = el.ecinstanceid ";
                    const aInstances = await BentleyAPIFunctions._executeQuery(vp.iModel, aInstanceQuery);
                    for await (const aInstance of aInstances) {
                        if (aInstance[0]) {
                            let aFound = undefined;
                            console.log("Searching Instance " + aInstance[0] + " for " + aResult[1]) ;                           
                            aFound = myfind(aRule.content, aInstance[1]);
                            if (!aFound) {
                                IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, aInstance[1] + " is not a valid entry"));
                                invalidElements.push(aInstance[0]);
                            }
                            else
                            {
                                console.log(aInstance[1] + " is defined as " + aFound.description)
                            }
                            // as we are not checking for properties with only instances we may be querying for classes with no instances
                        }
                    }
                    break;
                }
                case "propertyvalue" : {
                    let aInstanceQuery = aRule.checksql;
                    if (aResult[0].indexOf( 'Aspect') >= 0) {
                        aInstanceQuery = aInstanceQuery.replaceAll("<id>", 'element.id');
                    } else
                    {
                        aInstanceQuery = aInstanceQuery.replaceAll("<id>", 'ecinstanceid');
                    }

                    aInstanceQuery = aInstanceQuery.replaceAll("<classname>", aResult[0]);
                    aInstanceQuery = aInstanceQuery.replaceAll("<propertyname>", aResult[1]);
                    console.log("Checking : " + aInstanceQuery)
                    const aInstances = await BentleyAPIFunctions._executeQuery(vp.iModel, aInstanceQuery);
                    if (aInstances.length > 0) console.log("Found instances in : " + aInstanceQuery)

                    for await (const aInstance of aInstances) {
                        if (aInstance[0]) {
                                // IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, aInstance[1] + " is not a valid entry"));
                                invalidElements.push(aInstance[0]);
                            }
                            // as we are not checking for properties with only instances we may be querying for classes with no instances
                        }
                    }                    
                    break;

            }
        }
    }
    emphasizeResults(vp, invalidElements)

}