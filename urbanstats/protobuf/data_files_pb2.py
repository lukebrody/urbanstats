# pylint: skip-file
# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: data_files.proto
# Protobuf Python Version: 4.25.3
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder

# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(
    b'\n\x10\x64\x61ta_files.proto"\x8f\x01\n\x0cStatisticRow\x12\x0f\n\x07statval\x18\x01 \x01(\x02\x12\x1b\n\x13ordinal_by_universe\x18\x02 \x03(\x05\x12#\n\x1boverall_ordinal_by_universe\x18\x03 \x03(\x05\x12,\n$percentile_by_population_by_universe\x18\x04 \x03(\x02"F\n\rRelatedButton\x12\x10\n\x08longname\x18\x01 \x01(\t\x12\x11\n\tshortname\x18\x02 \x01(\t\x12\x10\n\x08row_type\x18\x03 \x01(\t"L\n\x0eRelatedButtons\x12\x19\n\x11relationship_type\x18\x01 \x01(\t\x12\x1f\n\x07\x62uttons\x18\x02 \x03(\x0b\x32\x0e.RelatedButton">\n\tHistogram\x12\x0f\n\x07\x62in_min\x18\x01 \x01(\x02\x12\x10\n\x08\x62in_size\x18\x02 \x01(\x02\x12\x0e\n\x06\x63ounts\x18\x03 \x03(\x05"\x1c\n\nTimeSeries\x12\x0e\n\x06values\x18\x01 \x03(\x02"w\n\x0e\x45xtraStatistic\x12"\n\thistogram\x18\x01 \x01(\x0b\x32\n.HistogramH\x00\x88\x01\x01\x12$\n\ntimeseries\x18\x02 \x01(\x0b\x32\x0b.TimeSeriesH\x01\x88\x01\x01\x42\x0c\n\n_histogramB\r\n\x0b_timeseries"\xcc\x01\n\x07\x41rticle\x12\x11\n\tshortname\x18\x01 \x01(\t\x12\x10\n\x08longname\x18\x02 \x01(\t\x12\x0e\n\x06source\x18\x03 \x01(\t\x12\x14\n\x0c\x61rticle_type\x18\x04 \x01(\t\x12\x1b\n\x04rows\x18\x05 \x03(\x0b\x32\r.StatisticRow\x12 \n\x07related\x18\x06 \x03(\x0b\x32\x0f.RelatedButtons\x12\x11\n\tuniverses\x18\x07 \x03(\t\x12$\n\x0b\x65xtra_stats\x18\x08 \x03(\x0b\x32\x0f.ExtraStatistic"&\n\nCoordinate\x12\x0b\n\x03lon\x18\x01 \x01(\x02\x12\x0b\n\x03lat\x18\x02 \x01(\x02"#\n\x04Ring\x12\x1b\n\x06\x63oords\x18\x01 \x03(\x0b\x32\x0b.Coordinate"\x1f\n\x07Polygon\x12\x14\n\x05rings\x18\x01 \x03(\x0b\x32\x05.Ring"*\n\x0cMultiPolygon\x12\x1a\n\x08polygons\x18\x01 \x03(\x0b\x32\x08.Polygon"|\n\x07\x46\x65\x61ture\x12\x1b\n\x07polygon\x18\x01 \x01(\x0b\x32\x08.PolygonH\x00\x12%\n\x0cmultipolygon\x18\x02 \x01(\x0b\x32\r.MultiPolygonH\x00\x12\r\n\x05zones\x18\x03 \x03(\x05\x12\x12\n\ncenter_lon\x18\x04 \x01(\x02\x42\n\n\x08geometry"\x1e\n\nStringList\x12\x10\n\x08\x65lements\x18\x01 \x03(\t"3\n\x0bSearchIndex\x12\x10\n\x08\x65lements\x18\x01 \x03(\t\x12\x12\n\npriorities\x18\x02 \x03(\r"\x1f\n\tOrderList\x12\x12\n\norder_idxs\x18\x01 \x03(\x05"8\n\x08\x44\x61taList\x12\r\n\x05value\x18\x01 \x03(\x02\x12\x1d\n\x15population_percentile\x18\x02 \x03(\x02"@\n\nOrderLists\x12\x11\n\tstatnames\x18\x01 \x03(\t\x12\x1f\n\x0border_lists\x18\x02 \x03(\x0b\x32\n.OrderList"=\n\tDataLists\x12\x11\n\tstatnames\x18\x01 \x03(\t\x12\x1d\n\ndata_lists\x18\x02 \x03(\x0b\x32\t.DataList"\x19\n\x08\x41llStats\x12\r\n\x05stats\x18\x01 \x03(\x02"A\n\x12\x43onsolidatedShapes\x12\x11\n\tlongnames\x18\x01 \x03(\t\x12\x18\n\x06shapes\x18\x02 \x03(\x0b\x32\x08.Feature"Y\n\x16\x43onsolidatedStatistics\x12\x11\n\tlongnames\x18\x01 \x03(\t\x12\x12\n\nshortnames\x18\x02 \x03(\t\x12\x18\n\x05stats\x18\x03 \x03(\x0b\x32\t.AllStatsb\x06proto3'
)

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, "data_files_pb2", _globals)
if _descriptor._USE_C_DESCRIPTORS == False:
    DESCRIPTOR._options = None
    _globals["_STATISTICROW"]._serialized_start = 21
    _globals["_STATISTICROW"]._serialized_end = 164
    _globals["_RELATEDBUTTON"]._serialized_start = 166
    _globals["_RELATEDBUTTON"]._serialized_end = 236
    _globals["_RELATEDBUTTONS"]._serialized_start = 238
    _globals["_RELATEDBUTTONS"]._serialized_end = 314
    _globals["_HISTOGRAM"]._serialized_start = 316
    _globals["_HISTOGRAM"]._serialized_end = 378
    _globals["_TIMESERIES"]._serialized_start = 380
    _globals["_TIMESERIES"]._serialized_end = 408
    _globals["_EXTRASTATISTIC"]._serialized_start = 410
    _globals["_EXTRASTATISTIC"]._serialized_end = 529
    _globals["_ARTICLE"]._serialized_start = 532
    _globals["_ARTICLE"]._serialized_end = 736
    _globals["_COORDINATE"]._serialized_start = 738
    _globals["_COORDINATE"]._serialized_end = 776
    _globals["_RING"]._serialized_start = 778
    _globals["_RING"]._serialized_end = 813
    _globals["_POLYGON"]._serialized_start = 815
    _globals["_POLYGON"]._serialized_end = 846
    _globals["_MULTIPOLYGON"]._serialized_start = 848
    _globals["_MULTIPOLYGON"]._serialized_end = 890
    _globals["_FEATURE"]._serialized_start = 892
    _globals["_FEATURE"]._serialized_end = 1016
    _globals["_STRINGLIST"]._serialized_start = 1018
    _globals["_STRINGLIST"]._serialized_end = 1048
    _globals["_SEARCHINDEX"]._serialized_start = 1050
    _globals["_SEARCHINDEX"]._serialized_end = 1101
    _globals["_ORDERLIST"]._serialized_start = 1103
    _globals["_ORDERLIST"]._serialized_end = 1134
    _globals["_DATALIST"]._serialized_start = 1136
    _globals["_DATALIST"]._serialized_end = 1192
    _globals["_ORDERLISTS"]._serialized_start = 1194
    _globals["_ORDERLISTS"]._serialized_end = 1258
    _globals["_DATALISTS"]._serialized_start = 1260
    _globals["_DATALISTS"]._serialized_end = 1321
    _globals["_ALLSTATS"]._serialized_start = 1323
    _globals["_ALLSTATS"]._serialized_end = 1348
    _globals["_CONSOLIDATEDSHAPES"]._serialized_start = 1350
    _globals["_CONSOLIDATEDSHAPES"]._serialized_end = 1415
    _globals["_CONSOLIDATEDSTATISTICS"]._serialized_start = 1417
    _globals["_CONSOLIDATEDSTATISTICS"]._serialized_end = 1506
# @@protoc_insertion_point(module_scope)
