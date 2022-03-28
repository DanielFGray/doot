FROM postgres:14

RUN apt-get update && apt-get upgrade -y

ENV build_deps ca-certificates \
	git \
	build-essential \
	libpq-dev \
	postgresql-server-dev-14

RUN apt-get install -y --no-install-recommends $build_deps

RUN mkdir -p /tmp/build \
  && cd /tmp/build \
	&& git clone https://github.com/theory/pgtap \
	&& cd pgtap \
	&& git checkout tags/v1.2.0 \
	&& make install

RUN mkdir -p /tmp/build \
	&& git clone https://github.com/iCyberon/pg_hashids \
	&& cd pg_hashids \
	&& make \
	&& make install

RUN apt-get install -y --no-install-recommends libicu-dev \
	&& cd /tmp/build \
	&& git clone https://github.com/okbob/plpgsql_check \
	&& cd plpgsql_check \
	&& git checkout tags/v2.1.2 \
	&& make clean \
	&& make install

RUN timescale_build_deps="cmake libkrb5-dev" \
  && apt-get install -y --no-install-recommends $timescale_build_deps \
	&& cd /tmp/build \
	&& git clone https://github.com/timescale/timescaledb \
  && cd timescaledb \
  && git checkout tags/2.6.0 \
  && ./bootstrap \
  && cd build && make \
  && make install \
	&& apt-get purge -y $timescale_build_deps

RUN mkdir -p /tmp/build \
	&& git clone https://github.com/citusdata/pg_cron \
	&& cd pg_cron \
	&& make \
	&& make install

RUN rm -fr /tmp/build \
	&& apt-get clean \
	&& apt-get autoremove -y $build_deps
