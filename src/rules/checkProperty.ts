import {
    EmphasizeElements,
    IModelApp,
    NotifyMessageDetails,
    OutputMessagePriority,
    StandardViewId,
  } from "@itwin/core-frontend";

  import { UiFramework } from "@itwin/appui-react";

function myfind(a : any, value: any) : any
{
    for (const item of a) {
        if (item.code.toUpperCase() === value.toUpperCase())
        {
            return item
        }
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
    for (const ruleset of Object.keys(rules.rules))
    {
        const aRule = rules.rules[ruleset];
        IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, " rule " + aRule.id));


        const aQuery = "select ec_classname(class.id, 's.c') as ecclass, name from meta.ecpropertydef where DisplayLabel like '%" + aRule.property + "%' OR Name like '%" + aRule.property + "%'"
        const aResults = UiFramework.getIModelConnection()!.query(aQuery);
        for await (const aResult of aResults) {
            // now we have a list of classes that are have a proeprty with the required property name
            // now let's find the instances
            switch (aRule.ruletype) {
                case "propertylist" : {
                    const aInstanceQuery = "select ecinstanceid as id, " + aResult.name + " as propertyname from " + aResult.ecclass;
                    const aInstances = UiFramework.getIModelConnection()!.query(aInstanceQuery);
                    for await (const aInstance of aInstances) {
                        if (aInstance.id) {
                            let aFound = undefined;
                            console.log("Searching for " + aInstance.propertyname) ;                           
                            aFound = myfind(aRule.content, aInstance.propertyname);
                            if (!aFound) {
                                IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, aInstance.propertyname + " is not a valid entry"));
                                invalidElements.push(aInstance.id);
                            }
                            else
                            {
                                console.log(aInstance.propertyname + " is defined as " + aFound.description)
                            }
                            // as we are not checking for properties with only instances we may be querying for classes with no instances
                        }
                    }
                    break;
                }
                case "propertyvalue" : {
                    let aInstanceQuery = aRule.checksql;
                    aInstanceQuery = aInstanceQuery.replaceAll("<classname>", aResult.ecclass);
                    aInstanceQuery = aInstanceQuery.replaceAll("<propertyname>", aResult.name);
                    const aInstances = UiFramework.getIModelConnection()!.query(aInstanceQuery);
                    for await (const aInstance of aInstances) {
                        if (aInstance.id) {
                                IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, aInstance.propertyname + " is not a valid entry"));
                                invalidElements.push(aInstance.id);
                            }
                            // as we are not checking for properties with only instances we may be querying for classes with no instances
                        }
                    }
                    break;

            }
        }
    }
    let emph = EmphasizeElements.getOrCreate(IModelApp.viewManager.selectedView!);      
    emph.wantEmphasis = true;  
    //IModelApp.viewManager.selectedView!.zoomToElements(invalidElements, { animateFrustumChange: true, standardViewId: StandardViewId.RightIso});
    emph.emphasizeElements(invalidElements, IModelApp.viewManager.selectedView!, undefined , true)

}