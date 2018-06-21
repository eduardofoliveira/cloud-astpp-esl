create table astpp_basix(
    uniqueid varchar(60) not null unique,
    user varchar(60) not null,
    cost_center varchar(60),
    key (uniqueid)
)