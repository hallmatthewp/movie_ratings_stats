import rx.Observable;
import com.netflix.api.service.APIRequest
import com.netflix.api.endpoint.APIEndpoint

import javax.servlet.http.HttpServletResponse

public class Ratings extends APIEndpoint {
    @Override
    public void execute(APIRequest api) {
        HttpServletResponse response = api.getServletResponse()

        response.setContentType("application/json; charset=UTF-8")
        response.setBufferSize(50);
        def writer = response.getWriter();
        writer.print("[")

        Observable
        .just('{"test":"test"},')
        .repeat(10000)
        .subscribe({
            writer.print(it)
            response.flushBuffer()
            writer.flush()
        }, {}, {writer.print('{}]')})
    }
}