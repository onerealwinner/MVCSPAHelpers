using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Controllers
{
    [HandleException]
    public class BaseController : Controller
    {
        public ActionResult SPAView(string viewName)
        {
            return SPAView(viewName);
        }
        public ActionResult SPAView(object viewModel)
        {
            return SPAView("", viewModel);
        }

        public ActionResult SPAView(string viewName = "", object viewModel = null)
        {
            if (HttpContext.Request.IsAjaxRequest())
            {
                //return partial
                return PartialView(viewName, viewModel);
            }
            else
            {
                //return full
                return View(viewName, viewModel);
            }
        }
    }

    public class HandleExceptionAttribute : HandleErrorAttribute
    {
        public override void OnException(ExceptionContext filterContext)
        {
            //TODO: ADD LOGGING FOR ERROR
			
            //do something
            if (filterContext.HttpContext.Request.IsAjaxRequest())
            {
                filterContext.ExceptionHandled = true;
                filterContext.HttpContext.Request.ContentType = "application/json";
                filterContext.HttpContext.Response.ContentType = "application/json"; //new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");

                //filterContext.Result = new HttpStatusCodeResult(500, "An error has occured; " + filterContext.Exception.Message);

                filterContext.HttpContext.Response.StatusCode = 500;
                filterContext.HttpContext.Response.TrySkipIisCustomErrors = true;

                filterContext.Result = new JsonResult
                {
                    Data = new { success = false, Message = "An error has occured; " + filterContext.Exception.Message }
                    ,JsonRequestBehavior = JsonRequestBehavior.AllowGet
                };
            }
            else
            {
                base.OnException(filterContext);
                //base.HandleUnauthorizedRequest(actionContext);
            }
        }
    }
}