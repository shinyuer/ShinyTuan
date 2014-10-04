<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;
using LitJson;
using System.Linq;
using System.Collections.Generic;
public class Handler : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/javascript";
        string htype = context.Request["type"];
        string result = "";
        if (htype != null && !string.IsNullOrEmpty(htype))
        {
            switch (htype)
            {
                case "tuanSites":
                    result = getResult_TuanSites();
                    break;
                case "tuanSites2":
                    result = getResult_TuanSites2();
                    break;    
                case "TuanCitys":
                    result = getResult_TuanCitys();
                    break; 
                case "tuanlist":
                   string city = context.Request["city"];
                   string tuansite = context.Request["tuansite"];  
                   int pageNo =Convert.ToInt32(context.Request["pageNo"]);
                   string orderby = context.Request["orderby"];
                   string dropClass = context.Request["dropClass"];
                   result = getResult_TuanList(city, tuansite, pageNo, orderby, dropClass);
                    break;
                case "tuandetail":
                    string ID = context.Request["id"];                  
                   result = getResult_TuanDetail(ID);
                    break;                    
                    
            }
        }
        context.Response.Write(result);
        context.Response.End();
    }


    public string getResult_TuanSites()
    {
        SiteModels.shinehouseEntities obj = new SiteModels.shinehouseEntities();
        var listtuansites = obj.TuanSite
            .Where(i => i.SiteTuanType == 1 && i.SiteState == 2)
            .Select(i => new { i.ID, i.siteName, i.siteID });
         System.Text.StringBuilder sb = new System.Text.StringBuilder();
         JsonWriter writer = new JsonWriter(sb);
         Common.Jsons.JsonWriterExpand.IQueryableToJsonOnly(writer, listtuansites);             
         return sb.ToString();
    }
    public string getResult_TuanSites2()
    {
        SiteModels.shinehouseEntities obj = new SiteModels.shinehouseEntities();
        var listtuansites = obj.TuanSite
            .Where(i => i.SiteTuanType == 2&& i.SiteState == 2)
            .Select(i => new { i.ID, i.siteName, i.siteID,i.ApiTuanUrl });
        System.Text.StringBuilder sb = new System.Text.StringBuilder();
        JsonWriter writer = new JsonWriter(sb);
        Common.Jsons.JsonWriterExpand.IQueryableToJsonOnly(writer, listtuansites);
        return sb.ToString();
    }
    


    public string getResult_TuanCitys()
    {        
        SiteModels.shinehouseEntities obj = new SiteModels.shinehouseEntities();
        var ga = from i in obj.TuanCitys
                   group i by i.Zimu into b
                   select new
                   {
                       b.Key,
                       b
                   };
        List<G3tuanModels.GCity> gcity = new List<G3tuanModels.GCity>();
        foreach (var i in ga)
        {
            var m = new G3tuanModels.GCity();
            m.Zimu = i.Key;
            m.LCity = new List<G3tuanModels.City>();
            foreach (var j in i.b)
            {
                var n = new G3tuanModels.City();
                n.cityname = j.cityname;
                n.pinyin = j.pinyin;
                m.LCity.Add(n);
            }
            gcity.Add(m);
        }

        string sb = "";
        foreach (var i in gcity)
        {
            string strcitys = "";
            foreach (var j in i.LCity)
            {
                if (strcitys != "") strcitys += ",";
                strcitys += string.Format("{{\"name\":\"{0}\",\"pinyin\":\"{1}\"}}", j.cityname, j.pinyin);           
            }
            if (sb != "") sb += ",";
            sb += (string.Format("{{\"Zimu\":\"{0}\",\"citys\":[{1}]}}", i.Zimu.ToUpper().Trim(), strcitys));
        }
        return "["+sb+"]";
    }

 
    public string getResult_TuanList(string city,string tuansite,int pageNo,string orderby,string dropClass)
    {
        SiteModels.shinehouseEntities obj = new SiteModels.shinehouseEntities();
        var list0 = obj.TuanDisplay.Where(i => i.city == city && i.website == tuansite && (string.IsNullOrEmpty(dropClass) || dropClass == "全部分类" ? true : i.title.Contains(dropClass)));
        switch (orderby)
        {
            case "datetime": list0 = list0.OrderBy(i => i.ID).Skip(10 * pageNo).Take(10); break;
            case "bought": list0 = list0.OrderBy(i => i.bought).Skip(10 * pageNo).Take(10); break;
            case "pricelow": list0 = list0.OrderBy(i => i.price).Skip(10 * pageNo).Take(10); break;
            case "pricehigh": list0 = list0.OrderByDescending(i => i.price).Skip(10 * pageNo).Take(10); break;     
        }
        
        
        var list = list0.Select(i => new { i.ID, i.website, i.image, i.title, i.detail, i.price, i.value, i.bought });
        System.Text.StringBuilder sb = new System.Text.StringBuilder();
        JsonWriter writer = new JsonWriter(sb);
        Common.Jsons.JsonWriterExpand.IQueryableToJsonOnly(writer, list);
        return sb.ToString();
    }

    public string getResult_TuanDetail(string ID)
    {
        int id = Convert.ToInt32(ID);
        SiteModels.shinehouseEntities obj = new SiteModels.shinehouseEntities();
        var list = obj.TuanDisplay.Where(i => i.ID==id).FirstOrDefault();
        System.Text.StringBuilder sb = new System.Text.StringBuilder();
        JsonWriter writer = new JsonWriter(sb);
        Common.Jsons.JsonWriterExpand.ClsToJson(writer, list);
        return sb.ToString();
    }



    public class G3tuanModels
    {
        public class GCity
        {
            public string Zimu { set; get; }
            public List<City> LCity { set; get; }
        }

        public class City
        {
            public string cityname { set; get; }
            public string pinyin { set; get; }
        }
    }

    
    
    public bool IsReusable {
        get {
            return false;
        }
    }

}