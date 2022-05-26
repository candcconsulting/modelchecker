"select ec_classname(class.id),  name, displaylabel from meta.ecpropertydef where displaylabel like '%102%Classification%'"

"select _102__x0020__ClassificationCode_PG_DATA_Text_TYPE from Bentley_Revit_Connector_Schema:Floors"

"select el.ecinstanceid as id, * from Bentley_Revit_Connector_Schema.Floors as el join bis.geometricelement3d as ge on ge.ecinstanceid = el.ecinstanceid where ifnull(_102__x0020__ClassificationCode_PG_DATA_Text_TYPE, '') not like ''"